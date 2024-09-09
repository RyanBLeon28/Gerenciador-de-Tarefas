import React, { useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const ModalAddTask = () => {

    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form
        .validateFields()
        .then((values) => {
            form.resetFields();
            console.log(values)
            success()
        })
        .catch((info) => {
            console.log("Validate Failed:", info);
        });
        setIsModalOpen(false);  
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
                    <Form.Item label="Título" name="title" required tooltip="Escreva o título da tarefa">
                        <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item label="Descrição" name="description" required tooltip="Escreva a descrição da tarefa">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
export default ModalAddTask;