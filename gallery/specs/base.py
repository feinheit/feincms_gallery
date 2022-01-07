class BaseSpec:
    def __init__(self, **kwargs):
        for arg in kwargs:
            setattr(self, arg, kwargs[arg])

    template_path = "content/gallery/"
    default_template = "%sclassiclm.html" % template_path
    paginated = False

    @property
    def templates(self):
        templates = [
            f"{self.template_path}{self.__class__.__name__.lower()}.html",
            self.default_template,
        ]

        if hasattr(self, "template_name"):
            templates.insert(0, f"{self.template_path}{self.template_name}")
        return templates

    @property
    def name(self):
        return self.__class__.__name__


class Type(BaseSpec):
    pass
