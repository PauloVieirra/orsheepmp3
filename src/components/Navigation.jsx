import React from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineHome, AiOutlineSearch, AiOutlineUnorderedList, AiOutlineSetting, AiOutlineWifi } from 'react-icons/ai'

const TabMenu = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  background: #1e1e1e;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 72px;
`

const TabLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#8B5CF6' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.8rem;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  
  svg {
    font-size: 1.5rem;
  }
  
  &:hover {
    color: white;
    background: rgba(139, 92, 246, 0.1);
  }

  &:active {
    background: rgba(139, 92, 246, 0.2);
  }
`

const Navigation = () => {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <TabMenu>
      <TabLink to="/" $active={isActive("/")}>
        <AiOutlineHome />
        Início
      </TabLink>
      <TabLink to="/search" $active={isActive("/search")}>
        <AiOutlineSearch />
        Buscar
      </TabLink>
      <TabLink to="/playlists" $active={isActive("/playlists")}>
        <AiOutlineUnorderedList />
        Playlists
      </TabLink>
      <TabLink to="/offline" $active={isActive("/offline")}>
        <AiOutlineWifi />
        Offline
      </TabLink>
      <TabLink to="/settings" $active={isActive("/settings")}>
        <AiOutlineSetting />
        Config.
      </TabLink>
    </TabMenu>
  )
}

export default Navigation 