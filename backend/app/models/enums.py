"""Shared skill enums."""

from enum import Enum


class SkillLevel(str, Enum):
	"""Skill level enum."""
	Beginner = "Beginner"
	Basic = "Basic"
	Intermediate = "Intermediate"
	Advanced = "Advanced"
	Specialist = "Specialist"


class SeniorityLevel(str, Enum):
	"""User seniority level."""
	Intern = "Intern"
	Junior = "Junior"
	MidLevel = "MidLevel"
	Senior = "Senior"


class SkillPriority(str, Enum):
	"""Skill priority enum used by job skills."""
	desirable = "desirable"
	required = "required"


class StudyPlanStatus(str, Enum):
	"""Study plan lifecycle status."""

	draft = "draft"
	active = "active"
	completed = "completed"
	archived = "archived"


class StudyPlanItemStatus(str, Enum):
	"""Study plan item lifecycle status."""

	pending = "pending"
	in_progress = "in_progress"
	completed = "completed"
	skipped = "skipped"
