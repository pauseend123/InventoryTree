"""Unit tests for task management."""

import os
from datetime import timedelta

from django.conf import settings
from django.core.management import call_command
from django.db.utils import NotSupportedError
from django.test import TestCase
from django.utils import timezone

from django_q.models import Schedule
from error_report.models import Error

import InvenTree.tasks
from common.models import InvenTreeSetting

threshold = timezone.now() - timedelta(days=30)
threshold_low = threshold - timedelta(days=1)


class ScheduledTaskTests(TestCase):
    """Unit tests for scheduled tasks."""

    def get_tasks(self, name):
        """Helper function to get a Schedule object."""
        return Schedule.objects.filter(func=name)

    def test_add_task(self):
        """Ensure that duplicate tasks cannot be added."""
        task = 'InvenTree.tasks.heartbeat'

        self.assertEqual(self.get_tasks(task).count(), 0)

        InvenTree.tasks.schedule_task(task, schedule_type=Schedule.MINUTES, minutes=10)

        self.assertEqual(self.get_tasks(task).count(), 1)

        t = Schedule.objects.get(func=task)

        self.assertEqual(t.minutes, 10)

        # Attempt to schedule the same task again
        InvenTree.tasks.schedule_task(task, schedule_type=Schedule.MINUTES, minutes=5)
        self.assertEqual(self.get_tasks(task).count(), 1)

        # But the 'minutes' should have been updated
        t = Schedule.objects.get(func=task)
        self.assertEqual(t.minutes, 5)


def get_result():
    """Demo function for test_offloading."""
    return 'abc'


class InvenTreeTaskTests(TestCase):
    """Unit tests for tasks."""

    def test_offloading(self):
        """Test task offloading."""
        # Run with function ref
        InvenTree.tasks.offload_task(get_result)

        # Run with string ref
        InvenTree.tasks.offload_task('InvenTree.test_tasks.get_result')

        # Error runs
        # Malformed taskname
        with self.assertWarnsMessage(UserWarning, "WARNING: 'InvenTree' not started - Malformed function path"):
            InvenTree.tasks.offload_task('InvenTree')

        # Non exsistent app
        with self.assertWarnsMessage(UserWarning, "WARNING: 'InvenTreeABC.test_tasks.doesnotmatter' not started - No module named 'InvenTreeABC.test_tasks'"):
            InvenTree.tasks.offload_task('InvenTreeABC.test_tasks.doesnotmatter')

        # Non exsistent function
        with self.assertWarnsMessage(UserWarning, "WARNING: 'InvenTree.test_tasks.doesnotexsist' not started - No function named 'doesnotexsist'"):
            InvenTree.tasks.offload_task('InvenTree.test_tasks.doesnotexsist')

    def test_task_hearbeat(self):
        """Test the task heartbeat."""
        InvenTree.tasks.offload_task(InvenTree.tasks.heartbeat)

    def test_task_delete_successful_tasks(self):
        """Test the task delete_successful_tasks."""
        from django_q.models import Success

        Success.objects.create(name='abc', func='abc', stopped=threshold, started=threshold_low)
        InvenTree.tasks.offload_task(InvenTree.tasks.delete_successful_tasks)
        results = Success.objects.filter(started__lte=threshold)
        self.assertEqual(len(results), 0)

    def test_task_delete_old_error_logs(self):
        """Test the task delete_old_error_logs."""
        # Create error
        error_obj = Error.objects.create()
        error_obj.when = threshold_low
        error_obj.save()

        # Check that it is not empty
        errors = Error.objects.filter(when__lte=threshold,)
        self.assertNotEqual(len(errors), 0)

        # Run action
        InvenTree.tasks.offload_task(InvenTree.tasks.delete_old_error_logs)

        # Check that it is empty again
        errors = Error.objects.filter(when__lte=threshold,)
        self.assertEqual(len(errors), 0)

    def test_task_check_for_updates(self):
        """Test the task check_for_updates."""
        # Check that setting should be empty
        self.assertEqual(InvenTreeSetting.get_setting('INVENTREE_LATEST_VERSION'), '')

        # Get new version
        InvenTree.tasks.offload_task(InvenTree.tasks.check_for_updates)

        # Check that setting is not empty
        response = InvenTreeSetting.get_setting('INVENTREE_LATEST_VERSION')
        self.assertNotEqual(response, '')
        self.assertTrue(bool(response))

    def test_task_check_for_migrations(self):
        """Test the task check_for_migrations."""
        # Update disabled
        InvenTree.tasks.check_for_migrations()

        # Update enabled - no migrations
        os.environ['INVENTREE_AUTO_UPDATE'] = 'True'
        InvenTree.tasks.check_for_migrations()

        # Create migration
        self.assertEqual(len(InvenTree.tasks.get_migration_plan()), 0)
        call_command('makemigrations', ['InvenTree', '--empty'], interactive=False)
        self.assertEqual(len(InvenTree.tasks.get_migration_plan()), 1)

        # Run with migrations - catch no foreigner error
        try:
            InvenTree.tasks.check_for_migrations()
        except NotSupportedError as e:  # pragma: no cover
            if settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3':
                raise e

        # Cleanup
        try:
            migration_name = InvenTree.tasks.get_migration_plan()[0][0].name + '.py'
            migration_path = settings.BASE_DIR / 'InvenTree' / 'migrations' / migration_name
            migration_path.unlink()
        except IndexError:  # pragma: no cover
            pass
