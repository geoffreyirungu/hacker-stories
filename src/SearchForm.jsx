import * as React from 'react';
import {InputWithLabel} from './InputWithLabel';

const SearchForm= ({searchTerm,onSearchSubmit,onSearchInput})=>(
    <form onSubmit={onSearchSubmit} className='search-form'>
  
        <InputWithLabel id="search" label="Search:" value={searchTerm} isFocussed  onInputChange={onSearchInput}>
          <strong>Search:</strong>
        </InputWithLabel>
  
        <button type="submit" disabled={!searchTerm} className='button button-large'>Submit</button>
  
    </form>
  );

  export {SearchForm};
