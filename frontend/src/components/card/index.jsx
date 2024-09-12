import { useContext } from "react";
import ModalUpdateTask from "../update";
import { Card } from "./style";
import { Flex, Button } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDrag } from "react-dnd";
import { TasksContext } from "../../context";
import { deleteTask } from "../../service/deleteTaskService";
import { taskList } from "../../service/tasklistService";

const TaskCard = ({ index, currentColumn, title, description}) => {
    
    const { toDo, doing, done, setToDo, setDoing, setDone, areas, selectedProject, setDeleteTask, setTasksList, setIsModalOpen} = useContext(TasksContext);

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

    const handleRemoveTask = async(task_id) => {
      if ( selectedProject ){
        let parent = areas.find(e => e.title === selectedProject);
        deleteTask(parent.id, task_id);
        const data = await taskList();
        setTasksList(data)
        // setDeleteTask(true);
      }
    }

    return(
      <Card key={index} ref={drag} style={{ opacity: isDragging ? "0.5" : "1" }} >
        <div className="task-header">
          <h4>{title}</h4>
          <Flex gap="small">
            <ModalUpdateTask id={index} title={title} description={description} status={currentColumn} />
            <Button 
              icon={<DeleteOutlined style={{ fontSize: '20px', color: "#FFF" }} />} 
              style={{ background: "transparent", border: "none" }} 
              onClick={() => handleRemoveTask(index)}
            />
          </Flex>
        </div>
        <p><strong>Descrição:</strong> {description} </p>
      </Card>
    );
}

export default TaskCard;