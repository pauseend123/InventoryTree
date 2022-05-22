"""
The InvenTreeBarcodePlugin validates barcodes generated by InvenTree itself.
It can be used as a template for developing third-party barcode plugins.

The data format is very simple, and maps directly to database objects,
via the "id" parameter.

Parsing an InvenTree barcode simply involves validating that the
references model objects actually exist in the database.
"""

# -*- coding: utf-8 -*-

import json

from rest_framework.exceptions import ValidationError

from part.models import Part
from plugin import InvenTreePlugin
from plugin.mixins import BarcodeMixin
from stock.models import StockItem, StockLocation


class InvenTreeBarcodePlugin(BarcodeMixin, InvenTreePlugin):

    NAME = "InvenTreeBarcode"

    def validate(self):
        """
        An "InvenTree" barcode must be a jsonnable-dict with the following tags:

        {
            'tool': 'InvenTree',
            'version': <anything>
        }

        """

        # The data must either be dict or be able to dictified
        if type(self.data) is dict:
            pass
        elif type(self.data) is str:
            try:
                self.data = json.loads(self.data)
                if type(self.data) is not dict:
                    return False
            except json.JSONDecodeError:
                return False
        else:
            return False  # pragma: no cover

        # If any of the following keys are in the JSON data,
        # let's go ahead and assume that the code is a valid InvenTree one...

        for key in ['tool', 'version', 'InvenTree', 'stockitem', 'stocklocation', 'part']:
            if key in self.data.keys():
                return True

        return True

    def getStockItem(self):

        for k in self.data.keys():
            if k.lower() == 'stockitem':

                data = self.data[k]

                pk = None

                # Initially try casting to an integer
                try:
                    pk = int(data)
                except (TypeError, ValueError):  # pragma: no cover
                    pk = None

                if pk is None:  # pragma: no cover
                    try:
                        pk = self.data[k]['id']
                    except (AttributeError, KeyError):
                        raise ValidationError({k: "id parameter not supplied"})

                try:
                    item = StockItem.objects.get(pk=pk)
                    return item
                except (ValueError, StockItem.DoesNotExist):  # pragma: no cover
                    raise ValidationError({k: "Stock item does not exist"})

        return None

    def getStockLocation(self):

        for k in self.data.keys():
            if k.lower() == 'stocklocation':

                pk = None

                # First try simple integer lookup
                try:
                    pk = int(self.data[k])
                except (TypeError, ValueError):  # pragma: no cover
                    pk = None

                if pk is None:  # pragma: no cover
                    # Lookup by 'id' field
                    try:
                        pk = self.data[k]['id']
                    except (AttributeError, KeyError):
                        raise ValidationError({k: "id parameter not supplied"})

                try:
                    loc = StockLocation.objects.get(pk=pk)
                    return loc
                except (ValueError, StockLocation.DoesNotExist):  # pragma: no cover
                    raise ValidationError({k: "Stock location does not exist"})

        return None

    def getPart(self):

        for k in self.data.keys():
            if k.lower() == 'part':

                pk = None

                # Try integer lookup first
                try:
                    pk = int(self.data[k])
                except (TypeError, ValueError):  # pragma: no cover
                    pk = None

                if pk is None:  # pragma: no cover
                    try:
                        pk = self.data[k]['id']
                    except (AttributeError, KeyError):
                        raise ValidationError({k: 'id parameter not supplied'})

                try:
                    part = Part.objects.get(pk=pk)
                    return part
                except (ValueError, Part.DoesNotExist):  # pragma: no cover
                    raise ValidationError({k: 'Part does not exist'})

        return None
