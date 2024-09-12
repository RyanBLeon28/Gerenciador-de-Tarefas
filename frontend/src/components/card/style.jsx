import styled from 'styled-components';

export const Card = styled.div`
    background: transparent; 
    border: 1px solid #DDD; 
    border-radius: 4px;
    box-sizing: border-box;
    cursor: grab;
    margin-bottom: 1rem;
    padding: 1rem;
    width: 100%;

    &:active{
        cursor: grabbing;
    }

    h4{
        margin: 0;
    }

    p{
        margin: 0.5rem 0;
    }

    .task-header{
        display: flex;
        justify-content: space-between;
    }
`;