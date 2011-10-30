from setuptools import setup, find_packages
from gallery import get_version
setup(
    name='feincms_gallery',
    version=get_version(),
    description='This is a gallery app and contenttype for Feincms.',
    author='',
    author_email='',
    url='https://github.com/feinheit/feincms_gallery',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    classifiers=[
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Utilities',
    ]
)
