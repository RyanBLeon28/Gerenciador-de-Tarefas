import { useContext } from "react";
import { Card } from "./style";
import { useDrag } from "react-dnd";
import { TasksContext } from "../../context";

const TaskCard = ({ index, currentColumn, title, responsible, description}) => {
    
    const { toDo, doing, done, setToDo, setDoing, setDone } = useContext(TasksContext);

    const [{ isDragging }, drag] = useDrag({
        type: "task",
        item: { index },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();  
            if (dropResult) {
                switch (currentColumn) {
                    case 1:
                        const toDoTask = toDo.find(element => element.id === item.index)
                        handleTask(toDoTask, dropResult.columnId)
                        setToDo(toDo.filter(element => element.id !== item.index));
                      break;
                    case 2:
                        const doingTask = doing.find(element => element.id === item.index)
                        handleTask(doingTask, dropResult.columnId)
                        setDoing(doing.filter(element => element.id !== item.index));
                      break;
                    case 3:
                        const doneTask = done.find(element => element.id === item.index)
                        handleTask(doneTask, dropResult.columnId)
                        setDone(done.filter(element => element.id !== item.index));
                      break;
                    default:
                      break;
                  }
            }
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
    });

    const handleTask = (task, id) => {
        switch (id) {
            case 1:
                setToDo((prevTasks) => [...prevTasks, task])
              break;
            case 2:
                setDoing((prevTasks) => [...prevTasks, task])
              break;
            case 3:
                setDone((prevTasks) => [...prevTasks, task])
              break;
            default:
              break;
        }
    }

    return(
        <Card key={index} ref={drag} style={{ opacity: isDragging ? "0.5" : "1" }} >
            <h4>{title}</h4>
            <p><strong>Responsável:</strong> {responsible}</p>
            <p><strong>Tarefa:</strong> {description}</p>
        </Card>
    );
}

export default TaskCard;