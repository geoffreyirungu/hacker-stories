import * as React from 'react';

const InputWithLabel= ({id,children,type='text',isFocussed,value,onInputChange})=>{

    const inputRef = React.useRef(null);
  
    React.useEffect(
      ()=>{
        if(isFocussed && inputRef.current){
          inputRef.current.focus();
        }
      },[isFocussed]
    );
  
  
    return   (
      <>
        <label htmlFor={id} className='label'>{children}</label>
        &nbsp;
        <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} className='input'/>
      </>
    )
  
  };

  export {InputWithLabel};
