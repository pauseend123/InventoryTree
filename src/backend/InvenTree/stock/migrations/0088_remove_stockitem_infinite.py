# Generated by Django 3.2.15 on 2022-09-22 02:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0087_auto_20220912_2341'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stockitem',
            name='infinite',
        ),
    ]