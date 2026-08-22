"""
Dayflow HRMS - Reports Module
Developer 4: Analytics, Reports, Notifications Integration & Testing

Provides report generation, CSV export formatting, and data transformation utilities.
"""

__all__ = ["ReportFormatter"]


class ReportFormatter:
    """Helper utilities for formatting corporate reports."""

    @staticmethod
    def format_currency(amount: float) -> str:
        return f"${amount:,.2f}"

    @staticmethod
    def sanitize_csv_field(val: str) -> str:
        if val is None:
            return ""
        return str(val).replace('"', '""')
