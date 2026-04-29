"""API dependencies."""

from fastapi import Request

from prisma import Prisma


def get_prisma(request: Request) -> Prisma:
	"""Provide the shared Prisma client."""

	return request.app.state.prisma
