import styled from 'styled-components'
import { useDroppable } from '@dnd-kit/core'
import { KanbanTask } from './KanbanTask'

const ColumnContainer = styled.div.attrs(props => ({
  'data-is-over': props.isOver
}))`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  transition: background-color 0.2s ease;

  &[data-is-over="true"] {
    background: rgba(255, 255, 255, 0.2);
  }
`

const ColumnTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  margin: 0;
  padding: 8px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`

const TaskList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`

export function KanbanColumn({ id, title, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-droppable`,
    data: {
      columnId: id
    }
  })

  return (
    <ColumnContainer isOver={isOver}>
      <ColumnTitle>{title}</ColumnTitle>
      <TaskList ref={setNodeRef}>
        {tasks.map(task => (
          <KanbanTask
            key={task.id}
            id={task.id}
            title={task.title}
            createdAt={task.createdAt}
          />
        ))}
      </TaskList>
    </ColumnContainer>
  )
}