# Generated by Django 3.2.21 on 2023-10-04 13:55

from django.db import migrations, connection


def migrate_tokens(apps, schema_editor):
    """Migrate existing API tokens across to the new table

    Note that at this point, we no longer have the 'authtoken' installed app,
    so we cannot import the model directly.

    Instead, we use the connection to manually query the database.
    """

    cursor = connection.cursor()

    try:
        cursor.execute('SELECT key, user_id FROM authtoken_token;')
        tokens = cursor.fetchall()
    except Exception as exc:
        print("Failed to fetch old tokens:", str(exc))
        tokens = []

    # get new model
    Token = apps.get_model('users', 'apitoken')

    if len(tokens) > 0:
        for t in tokens:
            key, user = t

            Token.objects.create(key=key, user_id=user)

        print("Migrated {n} tokens".format(n=len(tokens)))


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_alter_apitoken_unique_together'),
    ]

    operations = [
        migrations.RunPython(migrate_tokens, reverse_code=migrations.RunPython.noop)
    ]
