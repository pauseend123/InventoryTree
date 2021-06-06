# Generated by Django 3.2.1 on 2021-06-05 23:02

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('part', '0066_bomitem_allow_variants'),
        ('stock', '0063_auto_20210511_2343'),
    ]

    operations = [
        migrations.CreateModel(
            name='PartQuantityHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tracking_type', models.IntegerField(default=0)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('notes', models.CharField(blank=True, help_text='Entry notes', max_length=512, null=True, verbose_name='Notes')),
                ('deltas', models.JSONField(blank=True, null=True)),
                ('total_stock', models.DecimalField(decimal_places=5, default=1.0, max_digits=15, validators=[django.core.validators.MinValueValidator(0)], verbose_name='Total Stock')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='quantity_history', to='part.part')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
