"""Backward-compatible setup.py for warranty-tracker-lib."""
from setuptools import setup, find_packages

setup(
    name="warranty-tracker-lib",
    version="1.0.0",
    packages=find_packages(),
    python_requires=">=3.9",
    description="A library for managing product warranties, documents, and expiry reminders",
    author="Rasool Basha Durbesula",
    author_email="rasool@example.com",
    license="MIT",
)
