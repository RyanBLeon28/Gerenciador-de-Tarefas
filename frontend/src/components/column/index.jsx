import ModalAddTask from "../modal";
import ModalUpdateTask from "../update";
import TaskCard from "../card";
import { Column } from "./style";
import { useDrop } from "react-dnd";

const TaskColumn = ({ column, index, array}) => {

    const [{ canDrop, isOver }, dropref] = useDrop({
        accept: "task",
        drop: (item, monitor) => {
            return { columnId: index };  
        },
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
    });

    return(
        <Column ref={dropref} style={{ border: isOver ? "dashed 2px white" : "  " }}>
            <div className='headerColumn'>
                <h2>{column}</h2>
                <button className="setting-button" >
                    <p>...</p>
                </button>
            </div>
            {array.map((task, id) => (
                <TaskCard 
                    key={id} 
                    currentColumn={index}
                    index={task.id} 
                    title={task.title} 
                    description={task.description}
                    status={task.status}
                />
            ))}
            <ModalAddTask status={index}/>    
        </Column>
    );
}

export default TaskColumn;