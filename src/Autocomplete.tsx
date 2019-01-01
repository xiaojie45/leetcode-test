import React from 'react'
import { Subject, from } from 'rxjs'
import { switchMap, debounceTime, filter, takeUntil } from 'rxjs/operators'

import { MAXSEARCHLENGTH, URL } from './constant'
import spinnerIcon from './spinner.gif'
import searchIcon from './search.svg'
import './Autocomplete.scss'

const result: string[] = []
const initialState = {
	search: '',
	result,
	error: '',
	loading: false,
	hideResult: true
}
type State = Readonly<typeof initialState>

class Autocomplete extends React.Component<any, State> {
	state: State = initialState
	private search$: Subject<string> = new Subject()

	componentDidMount() {
		this.search$ = new Subject()
		this.getAutoSearch()
	}

	getSearchList = (word: string) => {
		this.setState({ loading: true })
		return fetch(`${URL}&search=${word}`).then((res) => res.json())
	}

	getAutoSearch = () => {
		/*istanbul ignore next*/
		const observer = {
			next: (value: Array<Array<string>>) => {
				this.setState({
					result: value[1],
					hideResult: false,
					loading: false
				})
			},
			complete: () => {
				this.setState({
					error: '您输入的字符数过多',
					loading: false
				})
			}
		}
		const exceedMaxLength$ = this.search$.pipe(
			filter((val: string) => val.length > MAXSEARCHLENGTH)
		)
		/*istanbul ignore next*/
		this.search$
			.pipe(
				debounceTime(500),
				switchMap((e: string) => from(this.getSearchList(e))),
				takeUntil(exceedMaxLength$)
			)
			.subscribe(observer)
	}

	onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ hideResult: true })
	}

	onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const search = e.target.value
		this.setState({ search })
		search && this.search$.next(search)
		if (search.length < MAXSEARCHLENGTH && this.state.error) {
			this.setState({ error: '' })
			this.getAutoSearch()
		}
	}

	render() {
		const { search, error, loading, hideResult, result } = this.state
		const searchBar = loading ? spinnerIcon : searchIcon
		return (
			<div className="Autocomplete">
				<div className="search-input">
					<input
						type="text"
						onBlur={this.onBlur}
						onChange={this.onSearch}
						value={search}
					/>
					<span>
						<img src={searchBar} alt="search icon" />
					</span>
				</div>
				{error ? (
					<div className="search-error">{error}</div>
				) : (
					<div className={`search-results ${hideResult && 'hide'}`}>
						{result.map((r: string) => {
							return <div key={r}>{r}</div>
						})}
					</div>
				)}
			</div>
		)
	}
}

export default Autocomplete
