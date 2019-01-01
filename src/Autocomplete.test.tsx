import React from 'react'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Subject } from 'rxjs'

import Autocomplete from './Autocomplete'

Enzyme.configure({ adapter: new Adapter() })
const { shallow } = Enzyme
const result = [
	'上海市',
	'上海地铁',
	'上海浦东国际机场',
	'上海交通大学',
	'上海虹桥国际机场',
	'上海话',
	'上海迪士尼樂園',
	'上海轨道交通2号线',
	'上海“11·15”特别重大火灾',
	'上海轨道交通1号线'
]

describe('autocomplete component', () => {
	const normalEventObj = {
		target: {
			value: 'shanghai'
		}
	}
	let search$: Subject<string>
	let wrapper: any

	beforeEach(() => {
		wrapper = shallow(<Autocomplete />)
		search$ = new Subject()
		search$.subscribe({
			next: (value) => {
				wrapper.setState({
					result: value || [],
					hideResult: false,
					loading: false
				})
				expect(wrapper.state(['result'])).toBe(value)
				expect(wrapper.state(['hideResult'])).toBe(false)
				expect(wrapper.state(['loading'])).toBe(false)
			},
			complete: () => {
				wrapper.setState({
					error: '您输入的字符数过多',
					loading: false
				})
				expect(wrapper.state(['error'])).toBe('您输入的字符数过多')
				expect(wrapper.state(['loading'])).toBe(false)
			}
		})
	})

	it('autocomplete should render correctly', () => {
		expect(wrapper).toMatchSnapshot()
	})

	it('input change should change state search', () => {
		wrapper.find('input').simulate('change', normalEventObj)
		expect(wrapper.state(['search'])).toBe('shanghai')
		expect(wrapper.state(['error'])).toBe('')
	})

	it('should hide when input field blur', () => {
		wrapper.find('input').simulate('blur')
		expect(wrapper.state(['hideResult'])).toBe(true)
	})

	it('should have at most results shown', () => {
		wrapper.setState({ result })
		expect(wrapper.find('.search-results div').length).toBe(10)
	})

	it('should have at most results shown', () => {
		wrapper.setState({ error: '您输入的字符数过多' })
		wrapper.find('input').simulate('change', normalEventObj)
		expect(wrapper.state(['error'])).toBe('')
	})

	it('should have loading icon spinning when calls api', () => {
		const instance = wrapper.instance()
		instance.getSearchList('上海')
		expect(wrapper.state(['loading'])).toBe(true)
	})

	it('should show result when it gets value', () => {
		search$.next(normalEventObj.target.value)
	})

	it('should show error when it completes', () => {
		search$.complete()
	})
})
