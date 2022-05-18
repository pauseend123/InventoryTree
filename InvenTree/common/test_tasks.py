# -*- coding: utf-8 -*-
from django.test import TestCase

from common.models import NotificationEntry
from . import tasks as common_tasks
from InvenTree.tasks import offload_task


class TaskTest(TestCase):
    """
    Tests for common tasks
    """

    def test_delete(self):

        # check empty run
        self.assertEqual(NotificationEntry.objects.all().count(), 0)
        offload_task(common_tasks.delete_old_notifications,)
