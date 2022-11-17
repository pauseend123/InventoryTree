# Generated by Django 3.2.16 on 2022-11-18 15:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0089_alter_stockitem_purchase_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='stocklocation',
            name='structural',
            field=models.BooleanField(default=False, help_text="Stock items may not be directly located into a structural stock locations, but may be located to it's child locations.", verbose_name='Structural'),
        ),
    ]
