# Generated by Django 4.2.9 on 2024-02-07 03:53

from django.db import migrations


def set_template(apps, schema_editor):
    """Matching existing StockItemTestResult objects to their associated template.

    - Use the 'key' value from the associated test object.
    - Look at the referenced part first
    - If no matches, look at parent part template(s)
    - If still no matches, create a new PartTestTemplate object
    """
    import time
    import InvenTree.helpers

    StockItemTestResult = apps.get_model('stock', 'stockitemtestresult')
    PartTestTemplate = apps.get_model('part', 'parttesttemplate')
    Part = apps.get_model('part', 'part')

    # Look at any test results which do not match a template
    results = StockItemTestResult.objects.filter(template=None)

    parts = results.values_list('stock_item__part', flat=True).distinct()

    n_results = results.count()

    if n_results == 0:
        return

    print(f"\n{n_results} StockItemTestResult objects do not have matching templates!")
    print(f"Updating test results for {len(parts)} unique parts...")

    # Keep a map of test templates 
    part_tree_map = {}

    t1 = time.time()

    new_templates = 0

    # For each part with missing templates, work out what templates are missing
    for pk in parts:
        part = Part.objects.get(pk=pk)
        tree_id = part.tree_id
        # Find all results matching this part
        part_results = results.filter(stock_item__part=part)
        test_names = part_results.values_list('test', flat=True).distinct()

        key_map = part_tree_map.get(tree_id, None) or {}

        for name in test_names:
            template = None

            key = InvenTree.helpers.generateTestKey(name)

            if template := key_map.get(key, None):
                # We have a template for this key
                pass

            elif template := PartTestTemplate.objects.filter(part__tree_id=part.tree_id, key=key).first():
                # We have found an existing template for this test
                pass
        
            elif template := PartTestTemplate.objects.filter(
                part__tree_id=part.tree_id,
                part__lft__lte=part.lft,
                part__rght__gte=part.rght,
                test_name__iexact=name).first():
                # We have found an existing template for this test
                pass

            # Create a new template, based on the available test information
            else:

                # Find the parent part template
                top_level_part = part

                while top_level_part.variant_of:
                    top_level_part = top_level_part.variant_of

                template = PartTestTemplate.objects.create(
                    part=top_level_part,
                    test_name=name,
                    key=key,
                )

                new_templates += 1

            # Finally, update all matching results
            part_results.filter(test=name).update(template=template)

            # Update the key map for this part tree
            key_map[key] = template
            
        # Update the part tree map
        part_tree_map[tree_id] = key_map

    t2 = time.time()
    dt = t2 - t1

    print(f"Updated {n_results} StockItemTestResult objects in {dt:.3f} seconds.")

    if new_templates > 0:
        print(f"Created {new_templates} new templates!")

    # Check that there are now zero reamining results without templates
    results = StockItemTestResult.objects.filter(template=None)
    assert(results.count() == 0)


def remove_template(apps, schema_editor):
    """Remove template links from existing StockItemTestResult objects."""

    StockItemTestResult = apps.get_model('stock', 'stockitemtestresult')
    results = StockItemTestResult.objects.all()
    results.update(template=None)

    if results.count() > 0:
        print(f"\nRemoved template links from {results.count()} StockItemTestResult objects")


class Migration(migrations.Migration):

    atomic = False

    dependencies = [
        ('stock', '0105_stockitemtestresult_template'),
        ('part', '0121_auto_20240207_0344')
    ]

    operations = [
        migrations.RunPython(set_template, reverse_code=remove_template),
    ]
