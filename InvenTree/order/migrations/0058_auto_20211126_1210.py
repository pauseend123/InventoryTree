# Generated by Django 3.2.5 on 2021-11-26 12:10

from django.db import migrations

from InvenTree.status_codes import SalesOrderStatus


def calculate_shipped_quantity(apps, schema_editor):
    """
    In migration 0057 we added a new field 'shipped' to the SalesOrderLineItem model.

    This field is used to record the number of items shipped,
    even if the actual stock items get deleted from the database.

    For existing orders in the database, we calculate this as follows:

    - If the order is "shipped" then we use the total quantity
    - Otherwise, we use the "fulfilled" calculated quantity

    """

    StockItem = apps.get_model('stock', 'stockitem')
    SalesOrderLineItem = apps.get_model('order', 'salesorderlineitem')

    for item in SalesOrderLineItem.objects.all():

        if item.order.status == SalesOrderStatus.SHIPPED:
            item.shipped = item.quantity
        else:
            # Calculate total stock quantity of items allocated to this order?
            items = StockItem.objects.filter(
                sales_order=item.order,
                part=item.part
            )

            q = sum([item.quantity for item in items])

            item.shipped = q

        item.save()


def reverse_calculate_shipped_quantity(apps, schema_editor):
    """
    Provided only for reverse migration compatibility.
    This function does nothing.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0057_salesorderlineitem_shipped'),
    ]

    operations = [
        migrations.RunPython(
            calculate_shipped_quantity,
            reverse_code=reverse_calculate_shipped_quantity
        )
    ]
