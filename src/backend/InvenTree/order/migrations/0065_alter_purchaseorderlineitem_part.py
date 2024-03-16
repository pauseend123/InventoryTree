# Generated by Django 3.2.12 on 2022-03-28 22:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('company', '0042_supplierpricebreak_updated'),
        ('order', '0064_purchaseorderextraline_salesorderextraline'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorderlineitem',
            name='part',
            field=models.ForeignKey(help_text='Supplier part', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='purchase_order_line_items', to='company.supplierpart', verbose_name='Part'),
        ),
    ]