# Generated by Django 4.2.11 on 2024-03-21 23:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

import common.status_codes


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('common', '0022_projectcode_responsible'),
    ]

    operations = [
        migrations.CreateModel(
            name='DataImportSession',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data_file', models.FileField(help_text='Data file to import', upload_to='import', verbose_name='Data File')),
                ('status', models.PositiveIntegerField(choices=common.status_codes.DataImportStatusCode.items(), default=0, help_text='Import status')),
                ('progress', models.PositiveIntegerField(default=0, verbose_name='Progress')),
                ('data_columns', models.JSONField(blank=True, null=True, verbose_name='Data Columns')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
        ),
    ]
