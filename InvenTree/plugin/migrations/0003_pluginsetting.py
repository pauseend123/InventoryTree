# Generated by Django 3.2.10 on 2021-12-21 21:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('plugin', '0002_alter_pluginconfig_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='PluginSetting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(help_text='Settings key', max_length=50, verbose_name='Key')),
                ('value', models.CharField(help_text='Settings value', max_length=200, verbose_name='Value')),
                ('plugin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to='plugin.pluginconfig', verbose_name='Plugin')),
            ],
            options={
                'unique_together': {('plugin', 'key')},
            },
        ),
    ]
