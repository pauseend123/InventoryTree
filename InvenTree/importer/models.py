"""Model definitions for the 'importer' app."""

from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

import importer.validators
import InvenTree.helpers
from importer.status_codes import DataImportStatusCode


class DataImportSession(models.Model):
    """Database model representing a data import session.

    An initial file is uploaded, and used to populate the database.

    Fields:
        data_file: FileField for the data file to import
        status: IntegerField for the status of the import session
        user: ForeignKey to the User who initiated the import
        progress: IntegerField for the progress of the import (number of rows imported)
        data_columns: JSONField for the data columns in the import file (mapped to database columns)
        field_overrides: JSONField for field overrides (e.g. custom field values)
    """

    data_file = models.FileField(
        upload_to='import',
        verbose_name=_('Data File'),
        help_text=_('Data file to import'),
        validators=[
            FileExtensionValidator(
                allowed_extensions=InvenTree.helpers.GetExportFormats()
            )
        ],
    )

    model_type = models.CharField(
        blank=False,
        max_length=100,
        validators=[importer.validators.validate_importer_model_type],
    )

    status = models.PositiveIntegerField(
        default=DataImportStatusCode.INITIAL.value,
        choices=DataImportStatusCode.items(),
        help_text=_('Import status'),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True, verbose_name=_('User')
    )

    progress = models.PositiveIntegerField(default=0, verbose_name=_('Progress'))

    data_columns = models.JSONField(
        blank=True, null=True, verbose_name=_('Data Columns')
    )

    field_overrides = models.JSONField(
        blank=True, null=True, verbose_name=_('Field Overrides')
    )