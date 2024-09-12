import React, { useState, useContext } from "react";
import { Button, Modal, Form, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TasksContext } from "../../context";
import { addTask } from "../../service/addTaskService";
import { createArea } from "../../service/createAreaService";

const ModalAddTask = ({ status }) => {

    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { areas } = useContext(TasksContext);
  
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form
        .validateFields()
        .then(async (value) => {
            form.resetFields();
            let parent_id = await handleParentId(value.area)
            addTask(parent_id, value.title, value.description, status);
            handleParentId(value.area)
            window.location.reload();
        })
        .catch((info) => {
            console.log("Validate Failed:", info);
        });
        setIsModalOpen(false);  
    };

    const handleParentId = async (area) => {
        let exists = areas.find(e => e.title === area) 
        
        if( !exists ){
            let newAreaId = await createArea(area);
            return newAreaId.id;
        } else {
            let parent_id = exists.id;
            return parent_id;
        }  
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button onClick={showModal} style={{ background: "transparent", borderColor: "#FFF", color: "#FFF" }}>
                <FontAwesomeIcon icon={faPlus} />
                Adicionar Task
            </Button>
            <Modal 
                title="Adicionar Tarefa" 
                open={isModalOpen} 
                onOk={handleOk} 
                okText={"Adicionar"}
                okButtonProps={{ style: { backgroundColor: "rgb(28, 115, 80)" } }} 
                onCancel={handleCancel}  
                cancelText={"Cancelar"}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item label="Título" name="title" required tooltip="Crie um título para a tarefa">
                        <Input placeholder="título" />
                    </Form.Item>
                    <Form.Item label="Área" name="area" required tooltip="Crie uma área para adicionar a tarefa">
                        <Input placeholder="título" />
                    </Form.Item>
                    <Form.Item label="Descrição" name="description" required tooltip="Crie uma descrição para tarefa">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default ModalAddTask;