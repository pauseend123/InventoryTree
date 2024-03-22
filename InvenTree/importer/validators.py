"""Custom validation routines for the 'importer' app."""

from django.core.exceptions import ValidationError


def supported_import_serializers():
    """Return a list of supported serializers which can be used for importing data."""
    import importer.registry

    val = importer.registry.get_supported_serializers()
    return val


def supported_models():
    """Return a map of supported models to their respective serializers."""
    data = {}

    for serializer in supported_import_serializers():
        model = serializer.Meta.model
        data[model.__name__.lower()] = serializer

    return data


def allowed_importer_model_types():
    """Returns a list of allowed model type values for the DataImportSession model."""
    return supported_models().keys()


def validate_importer_model_type(value):
    """Validate that the given model type is supported for importing."""
    if value not in allowed_importer_model_types():
        raise ValidationError(f"Unsupported model type '{value}'")