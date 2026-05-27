"""Shared skill enums."""

from enum import Enum


class SkillLevel(str, Enum):
	"""Skill level enum."""
	Beginner = "Beginner"
	Basic = "Basic"
	Intermediate = "Intermediate"
	Advanced = "Advanced"
	Specialist = "Specialist"


class SkillPriority(str, Enum):
	"""Skill priority enum used by job skills."""
	desirable = "desirable"
	required = "required"