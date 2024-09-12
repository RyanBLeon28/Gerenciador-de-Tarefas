import React, { useState, useContext, useEffect } from "react";
import { Button, Modal, Form, Input } from "antd";
import { EditOutlined } from '@ant-design/icons';
import { TasksContext } from "../../context";
import { createArea } from "../../service/createAreaService";
import { updateTask } from "../../service/updateTaskService";

const ModalUpdateTask = ({ id, title, description, status }) => {

    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { areas } = useContext(TasksContext);
    const { selectedProject, setSelectedProject } = useContext(TasksContext);
    const { setTasksList, updateFlag, setUpdateFlag } = useContext(TasksContext);

    useEffect(() => {
        if (isModalOpen) {
            let area = areas.find(e => e.title === selectedProject) 
            form.setFieldsValue({
                title: title,
                area: area.title,
                description: description,
            });
        }
    }, [isModalOpen]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form
        .validateFields()
        .then(async (value) => {
            form.resetFields();
            let parent_id = await handleParentId(value.area)
            updateTask(parent_id, id, value.title, value.description, status);
            handleParentId(value.area)
            setUpdateFlag(!updateFlag)
            // const data = await taskList();
            // setTasksList(data)
            // window.location.reload();
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
            <Button 
                onClick={showModal} 
                icon={<EditOutlined style={{ fontSize: '20px', color: "#FFF" }} />} 
                style={{ background: "transparent", border: "none" }}
            /> 
            <Modal 
                title="Editar Tarefa" 
                open={isModalOpen} 
                onOk={handleOk} 
                okText={"Editar"}
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
                    <Form.Item label="Descrição" name="description"  required tooltip="Crie uma descrição para tarefa">
                        <Input.TextArea
                            placeholder="descrição"
                            autoSize={{
                                minRows: 3,
                                maxRows: 5,
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default ModalUpdateTask;

// <Button onClick={showModal} style={{ background: "transparent", borderColor: "#FFF", color: "#FFF" }}>
            //     <FontAwesomeIcon icon={faPlus} />
            //     Adicionar Task
            // </Button>