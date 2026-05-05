import styles from './TabSwitcher.module.css'

export type TabSwitcherItem = {
  id: string
  label: string
  href?: string
}

type TabSwitcherProps = {
  tabs: TabSwitcherItem[]
  activeTabId: string
  onTabChange?: (tab: TabSwitcherItem) => void
  className?: string
}

function TabSwitcher({ tabs, activeTabId, onTabChange, className }: TabSwitcherProps) {
  return (
    <div className={`${styles.switcher} ${className ?? ''}`.trim()} role="tablist" aria-label="Alternar abas de vagas">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange?.(tab)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default TabSwitcher
