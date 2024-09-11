import React, { useState, useContext } from "react";
import { Button, Modal, Form, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TasksContext } from "../../context";
import { RetrieveToken } from "../../service/util";

const ModalAddTask = () => {

    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { selectedProject, setSelectedProject } = useContext(TasksContext);
  
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form
        .validateFields()
        .then((value) => {
            form.resetFields();
            const result = selectedProject.some(element => element.area === value.area);
            if(result){
                handleAddTask();
            } else {
                handleAddArea();
                handleAddTask();
            }
            console.log(value)
            success();
        })
        .catch((info) => {
            console.log("Validate Failed:", info);
        });
        setIsModalOpen(false);  
    };

    const handleAddArea = async (event) => {
        // event.preventDefault();
        
        // try {
        // const response = await fetch('http://localhost:6900/user/taklist', {
        //     method: 'POST',
        //     headers: {
        //     'Content-Type': 'application/json',
        //     'token': RetrieveToken
        //     },
        //     body: JSON.stringify({ event }),
        // });
    
        // if (!response.ok) {
        //     throw new Error('Erro ao criar .');
        // }
        // } catch (err) {
        // console.log(err.message);
        // }
        
    };

    const handleAddTask = () => {

    }

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