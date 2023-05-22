"""Generic implementation of status for InvenTree models."""
import enum


class BaseEnum(enum.Enum):
    """
    An `Enum` capabile of having its members have docstrings

    Should be passed in the form of:
      value, docstring

    Based on https://stackoverflow.com/questions/19330460/how-do-i-put-docstrings-on-enums
    """

    def __new__(cls, *args):
        obj = object.__new__(cls)
        obj._value_ = args[0]
        return obj

    def __eq__(self, obj):
        if type(self) == type(obj):
            return super().__eq__(obj)
        return self.value == obj

    def __ne__(self, obj):
        if type(self) == type(obj):
            return super().__ne__(obj)
        return self.value != obj

    def __init__(self, *args):
        """
        Creates a generic enumeration with potential assigning of a member docstring

        Should be passed in the form of:
          value, docstring
        Or:
          docstring
        """
        if len(args) == 2 and isinstance(args[-1], str):
            self.__doc__ = args[-1]


class StatusCode(BaseEnum):
    """Base class for representing a set of StatusCodes.

    Use enum syntax to define the status codes, e.g.
    ```python
    PENDING = 10, _("Pending"), 'secondary'
    ```
    """

    def __new__(cls, *args):
        """Define object out of args."""
        obj = object.__new__(cls)
        obj._value_ = args[0]
        if len(args) == 1:
            obj.label = args[0]
            obj.color = 'secondary'
        else:
            obj.label = args[1]
            obj.color = args[2] if len(args) > 2 else 'secondary'
        return obj

    @classmethod
    def _is_element(cls, d):
        """Check if the supplied value is a valid status code."""
        if d.startswith('_'):
            return False
        if d != d.upper():
            return False

        value = getattr(cls, d, None)

        if value is None:
            return False
        if callable(value):
            return False
        if type(value.value) != int:
            return False
        # if value not in keys:
        #     continue
        return True

    @classmethod
    def values(cls, key=None):
        """Return a dict representation containing all required information"""
        elements = [itm for itm in cls if cls._is_element(itm.name)]
        if key is None:
            return elements

        ret = [itm for itm in elements if itm.value == key]
        if ret:
            return ret[0]
        return None

    @classmethod
    def render(cls, key, large=False):
        """Render the value as a HTML label."""
        # If the key cannot be found, pass it back
        item = cls.values(key)
        if not item:
            return key

        return f"<span class='badge rounded-pill bg-{item.color}'>{item.label}</span>"

    @classmethod
    def tag(cls):
        """Return tag for this status code."""
        return cls._TAG.value

    @classmethod
    def items(cls):
        """All status code items."""
        return [(x.value, x.label) for x in cls.values()]

    @classmethod
    def keys(cls):
        """All status code keys."""
        return [x.value for x in cls.values()]

    @classmethod
    def labels(cls):
        """All status code labels."""
        return [x.label for x in cls.values()]

    @classmethod
    def names(cls):
        """Return a map of all 'names' of status codes in this class."""
        return {x.name: x.value for x in cls.values()}

    @classmethod
    def text(cls, key):
        """Text for supplied status code."""
        filtered = cls.values(key)
        if filtered is None:
            return key
        return filtered.label

    @classmethod
    def label(cls, key):
        """Return the status code label associated with the provided value."""
        filtered = cls.values(key)
        if filtered is None:
            return key
        return filtered.label

    @classmethod
    def dict(cls, key=None):
        """Return a dict representation containing all required information"""
        return {x.name: {
            'color': x.color,
            'key': x.value,
            'label': x.label,
            'name': x.name,
        } for x in cls.values(key)}

    @classmethod
    def list(cls):
        """Return the StatusCode options as a list of mapped key / value items."""
        return list(cls.dict().values())
