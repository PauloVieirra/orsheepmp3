import styled from 'styled-components'
import { KanbanColumn } from './KanbanColumn'

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
  margin: 20px 0;
  height: calc(100vh - 200px);
`

const columnTitles = {
  'to-do': 'A Fazer',
  'in-progress': 'Em Progresso',
  'review': 'Revisão',
  'done': 'Concluído'
}

export function KanbanBoard({ tasks }) {
  return (
    <BoardContainer>
      {Object.entries(tasks).map(([columnId, columnTasks]) => (
        <KanbanColumn
          key={columnId}
          id={columnId}
          title={columnTitles[columnId]}
          tasks={columnTasks}
        />
      ))}
    </BoardContainer>
  )
}