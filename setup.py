#!/usr/bin/env python

import os
from setuptools import setup, find_packages

setup(
	name = 'feincms-gallery',
	packages = find_packages(),
    include_package_data=True,
    version=__import__('gallery').__version__,
    description='A gallery for FeinCMS',
    long_description=open(os.path.join(os.path.dirname(__file__), 'README.rst')).read(),
    author='Simon Baechler',
    author_email='sb@feinheit.ch',
    url='https://github.com/feinheit/feincms_gallery',
    license='BSD License',
    platforms=['OS Independent'],
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Software Development',
        'Topic :: Software Development :: Libraries :: Application Frameworks',
    ],
)
