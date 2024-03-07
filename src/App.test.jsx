import {describe,it,expect,vi} from 'vitest';
import{render,screen,fireEvent,waitFor} from '@testing-library/react';
import axios from 'axios';

import App, {storiesReducer,Item,List,InputWithLabel,SearchForm} from './App';



vi.mock('axios');

const storyOne = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
    };
    const storyTwo = {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
};
const stories = [storyOne, storyTwo];
  
describe('stories reducer',()=>{
    it('removes a story from all stories',()=>{
        const state = {data:stories, isLoading:false, isError:false};
        const action = {type:'REMOVE_STORY',payload:storyOne}

        const newState = storiesReducer(state,action);
        const expectedState = {data:[storyTwo], isLoading:false, isError:false};

        expect(newState).toStrictEqual(expectedState);

    })
});


describe('Item',()=>{
    it('renders all properties',()=>{
        render(<Item item={storyOne}/>);
        expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
        expect(screen.getByText('React')).toHaveAttribute('href','https://reactjs.org/');
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('clicking the dismiss button calls callback handler',()=>{
        const handleRemoveItem = vi.fn();
        render(<Item item={storyOne} onRemoveItem={handleRemoveItem}/>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    });


});

describe('SearchForm',()=>{
    const searchFormProps = {
        searchTerm: 'React',
        onSearchSubmit: vi.fn(),
        onSearchInput: vi.fn()
    };

    it('renders the input field with its value',()=>{
        

        render(<SearchForm {...searchFormProps}/>);

        expect(screen.getByDisplayValue('React')).toBeInTheDocument();
    });

    it('renders the correct label',()=>{
        render(<SearchForm {...searchFormProps}/>);

        expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
    });

    it('calls onSearchInput when search term changes',()=>{
        render(<SearchForm {...searchFormProps}/>);
        fireEvent.change(screen.getByDisplayValue('React'),{target:{value:'Another value'}});
        expect(searchFormProps.onSearchInput).toBeCalledTimes(1);
    });

    it('calls onSearchSubmit on button submit click',()=>{
        render(<SearchForm {...searchFormProps}/>);
        fireEvent.submit(screen.getByRole('button'));
        expect(searchFormProps.onSearchSubmit).toBeCalledTimes(1);
    });

    it('renders snapshot',()=>{
        const{container}=render(<SearchForm {...searchFormProps}/>);
        expect(container.firstChild).matchSnapshot();
    });

});

describe('App',()=>{

    it('It succeeds fetching data',async ()=>{
        
        const promise = Promise.resolve({
            data:{
                hits: stories
            }
        });

        axios.get.mockImplementationOnce(()=>promise);

        render(<App/>);
        expect(screen.getByText(/Loading/)).toBeInTheDocument();

        await waitFor(async () =>  await promise);
        expect(screen.queryByText(/Loading/)).toBeNull();

        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Redux')).toBeInTheDocument();
        expect(screen.getAllByText('Dismiss').length).toBe(2);

    });

    it('fails fetching data',async ()=>{
        const promise = Promise.reject();

        axios.get.mockImplementationOnce(()=>promise);

        render(<App/>);

        expect(screen.getByText(/Loading/)).toBeInTheDocument();

        try{
            await waitFor(async () =>  await promise);
        }catch{
            expect(screen.queryByText(/Loading/)).toBeNull();
            expect(screen.getByText(/went wrong/)).toBeInTheDocument();
        }

    });

    it('removes a story',async ()=>{
        const promise = Promise.resolve({data:{hits:stories}});
        axios.get.mockImplementationOnce(()=>promise);

        render(<App/>);

        await waitFor(async () => promise);

        expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
        expect(screen.getAllByText('Dismiss').length).toBe(2);

        fireEvent.click(screen.getAllByText('Dismiss')[0]);

        expect(screen.queryByText('Jordan Walke')).toBeNull();
        expect(screen.getAllByText('Dismiss').length).toBe(1);

    });

    it('searches for specific story',async ()=>{
        const reactPromise = Promise.resolve({data:{hits:stories}});

        const anotherStory = {
            title: 'JavaScript',
            url: 'https://en.wikipedia.org/wiki/JavaScript',
            author: 'Brendan Eich',
            num_comments: 15,
            points: 10,
            objectID: 3,
        };

        const javaScriptPromise = Promise.resolve({data:{hits:[anotherStory]}});

        
        axios.get.mockImplementation((url)=>{
            if(url.includes('React'))
                return reactPromise;
            if(url.includes('JavaScript'))
                return javaScriptPromise;
            throw Error;
        });

        render(<App/>);

        await waitFor(async ()=> reactPromise);

        expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
        expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
        expect(screen.queryByText('Brendan Eich')).toBeNull();

        fireEvent.change(screen.queryByDisplayValue('React'),{target:{value:'JavaScript'}});

        expect(screen.queryByDisplayValue('React')).toBeNull();
        expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

        fireEvent.submit(screen.getByText('Submit'));

        await waitFor(async ()=> javaScriptPromise);

        expect(screen.queryByDisplayValue('React')).toBeNull();
        expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();
        expect(screen.queryByText('Jordan Walke')).toBeNull();
        expect(screen.queryByText('Brendan Eich')).toBeInTheDocument();

    });

    

    

});





