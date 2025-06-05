import styled from 'styled-components'
import { useDraggable } from '@dnd-kit/core'

const TaskCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  transform: ${props => props.isDragging ? 'scale(1.05)' : 'scale(1)'};
  opacity: ${props => props.isDragging ? '0.5' : '1'};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`

const TaskTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 1rem;
`

const TaskDate = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
`

export function KanbanTask({ id, title, createdAt }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id
  })

  return (
    <TaskCard
      ref={setNodeRef}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <TaskTitle>{title}</TaskTitle>
      <TaskDate>
        {new Date(createdAt).toLocaleDateString()}
      </TaskDate>
    </TaskCard>
  )
}