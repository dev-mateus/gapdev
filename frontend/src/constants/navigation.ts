/// Este arquivo contém as constantes relacionadas à navegação do aplicativo, como os itens do sidebar e suas propriedades.
///Altere aqui para modificar os links de navegação, ícones ou outras propriedades relacionadas à estrutura de navegação do aplicativo.
/// Livre para alterações, mas mantenha a consistência dos tipos e estruturas para evitar erros de navegação.
export const SIDEBAR_BRAND = {
	name: 'Skill Progress',
	iconKey: 'brandChart',
	href: '/dashboard',
} as const

export const SIDEBAR_NAV_LINKS = [
	{
		id: 'perfil',
		label: 'Perfil',
		href: '/perfil',
		iconKey: 'profile',
	},
	{
		id: 'vagas',
		label: 'Vagas',
		href: '/vagas',
		iconKey: 'jobs',
	},
	{
		id: 'analise',
		label: 'Análise',
		href: '/analise',
		iconKey: 'analysis',
	},
	{
		id: 'plano-estudos',
		label: 'Plano de estudos',
		href: '/plano-estudos',
		iconKey: 'studyPlan',
	},
	{
		id: 'progresso',
		label: 'Progresso',
		href: '/progresso',
		iconKey: 'progress',
	},
	{
		id: 'historico-vagas',
		label: 'Histórico de Vagas',
		href: '/historico-vagas',
		iconKey: 'jobsHistory',
	},
] as const

export const DEFAULT_ACTIVE_NAV_ITEM_ID = 'perfil' as const

export type SidebarBrand = typeof SIDEBAR_BRAND
export type SidebarNavItem = (typeof SIDEBAR_NAV_LINKS)[number]
export type SidebarNavItemId = SidebarNavItem['id']
export type SidebarIconKey = SidebarNavItem['iconKey'] | SidebarBrand['iconKey']