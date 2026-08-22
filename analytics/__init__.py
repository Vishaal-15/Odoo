"""
Dayflow HRMS - Analytics Module
Developer 4: Analytics, Reports, Notifications Integration & Testing

Provides helper classes, aggregators, and metrics calculation utilities.
"""

__all__ = ["AnalyticsHelper"]


class AnalyticsHelper:
    """Helper utilities for metric calculations."""

    @staticmethod
    def calculate_attendance_percentage(present_count: int, total_count: int) -> float:
        if total_count <= 0:
            return 100.0
        return round((present_count / total_count) * 100.0, 1)

    @staticmethod
    def calculate_retention_rate(active_count: int, total_count: int) -> str:
        if total_count <= 0:
            return "100.0%"
        return f"{round((active_count / total_count) * 100.0, 1)}%"
