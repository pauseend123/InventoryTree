# Generated by Django 2.2.10 on 2020-04-12 23:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0014_auto_20200407_0116'),
    ]

    operations = [
        migrations.AddField(
            model_name='company',
            name='is_manufacturer',
            field=models.BooleanField(default=True, help_text='Does this company manufacture parts?'),
        ),
    ]
