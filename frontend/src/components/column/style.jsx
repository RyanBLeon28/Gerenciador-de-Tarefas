import styled from 'styled-components';

const primaryColor = "rgb(28, 115, 80)"

export const Column = styled.div`
    background: ${primaryColor}; 
    box-sizing: border-box;
    border-radius: 8px; 
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-height: calc(100vh - 8rem);
    min-height: 50px; 
    padding: 10px;
    padding-left: 2rem;
    padding-right: 2rem;
    overflow-y: auto;
    width: 20rem;

    &::-webkit-scrollbar{
	width: 10px;
    }

    &::-webkit-scrollbar-track{
        background: #f1f1f1; 
    }

    &::-webkit-scrollbar-thumb{
        background: #626567;
        border-radius: 20px; 
    } 

    &::-webkit-scrollbar-thumb:hover{
        text-align: end;
    }

    div.headerColumn{
        display: flex;
        justify-content: space-between;
    }

    button.setting-button{
        background-color: transparent;
        border: none;
    }
`;