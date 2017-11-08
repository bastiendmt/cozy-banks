import React, { Component } from 'react'
import { withRouter } from 'react-router'
import cx from 'classnames'
import { translate } from 'cozy-ui/react/I18n'
import Toggle from 'cozy-ui/react/Toggle'
import CategoryIcon from './CategoryIcon'
import { Media, Bd, Img } from 'components/Media'
import { Table, TdWithIcon, TdSecondary } from 'components/Table'
import { Figure, FigureBlock } from 'components/Figure'
import { SelectDates } from 'ducks/filters'
import styles from './styles'
import CategoriesChart from './CategoriesChart'
import breakpointsAware from 'utils/breakpointsAware'
import { flowRight as compose } from 'lodash'

const stAmount = styles['bnk-table-amount']
const stCategory = styles['bnk-table-category-category']
const stChevron = styles['bnk-table-chevron']
const stFigure = styles['bnk-cat-figure']
const stFilter = styles['bnk-cat-filter']
const stForm = styles['bnk-cat-form']
const stPercentage = styles['bnk-table-percentage']
const stRow = styles['bnk-table-row']
const stRowSub = styles['bnk-table-row-subcategory']
const stTableCategory = styles['bnk-table-category']
const stTop = styles['bnk-cat-top']
const stTotal = styles['bnk-table-total']
const stUncollapsed = styles['bnk-table-row--uncollapsed']
const stCatTotalMobile = styles['bnk-category-total-mobile']

const vHidden = { visibility: 'hidden' }

class Categories extends Component {
  toggle = categoryName => {
    const { selectedCategory, selectCategory } = this.props
    selectedCategory ? selectCategory(undefined) : selectCategory(categoryName)
  }

  render ({t, categories, selectedCategory, selectCategory, withIncome, filterWithInCome, breakpoints: { isDesktop, isTablet }}) {
    if (categories === undefined) categories = []
    const selectedCat = categories.find(category => category.name === selectedCategory)
    if (selectedCategory) {
      if (selectedCat) {
        categories = [selectedCat]
      } else {
        categories = []
      }
    }
    let transactionsTotal = 0
    const globalCurrency = categories.length > 0 ? categories[0].currency : '€'

    if (categories.length !== 0) {
      // compute some global data
      const absoluteTransactionsTotal = categories.reduce((total, category) => (total + Math.abs(category.amount)), 0)
      for (let category of categories) {
        category.percentage = Math.round(Math.abs(category.amount) / absoluteTransactionsTotal * 100)
        const absoluteSubcategoriesTotal = category.subcategories.reduce((total, category) => (total + Math.abs(category.amount)), 0)
        for (let subcategory of category.subcategories) {
          if (absoluteSubcategoriesTotal === 0) {
            subcategory.percentage = 100
          } else {
            subcategory.percentage = Math.round(Math.abs(subcategory.amount) / absoluteSubcategoriesTotal * 100)
          }
        }
        category.subcategories = category.subcategories.sort((a, b) => {
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage
          } else {
            return a.amount - b.amount
          }
        })
        transactionsTotal += category.amount
      }
    }

    // sort the categories for display
    categories = categories.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage
      } else {
        return a.amount - b.amount
      }
    })

    let titleLabel = withIncome ? t('Categories.title.total') : t('Categories.title.debit')
    if (selectedCat) {
      const catName = t(`Data.categories.${selectedCat.name}`)
      titleLabel = `${titleLabel} (${catName})`
    }

    return (
      <div>
        <SelectDates />
        <div className={stTop}>
          <div className={stForm}>
            {selectedCategory === undefined && <div className={stFilter}>
              <Toggle id='withIncome' checked={withIncome} onToggle={checked => filterWithInCome(checked)} />
              <label htmlFor='withIncome'>
                Inclure les revenus
              </label>
            </div>}
            {categories.length > 0 && <FigureBlock
              className={stFigure}
              label={titleLabel}
              total={selectedCat ? selectedCat.amount : transactionsTotal}
              currency={globalCurrency}
              coloredPositive coloredNegative signed />}
          </div>
          <CategoriesChart categories={categories} selectedCategory={selectedCategory} selectCategory={selectCategory} />
        </div>
        {categories.length === 0
          ? <p>{t('Categories.title.empty_text')}</p>
          : <Table className={stTableCategory}>
            <thead>
              <tr>
                <td className={stCategory}>{t('Categories.headers.categories')}</td>
                <td className={stPercentage}>%</td>
                {(isDesktop || isTablet) && <td >{t('Categories.headers.transactions')}</td>}
                <td className={stTotal}>{t('Categories.headers.total')}</td>
                {isDesktop && <td className={stAmount}>{t('Categories.headers.credit')}</td>}
                {isDesktop && <td className={stAmount}>{t('Categories.headers.debit')}</td>}
                {isDesktop && <td className={stChevron} />}
              </tr>
            </thead>
            {categories.map(category => this.renderCategory(category, selectedCategory))}
          </Table>
        }
      </div>
    )
  }

  renderCategory (category) {
    const { selectedCategory, breakpoints: { isDesktop, isTablet } } = this.props

    const isCollapsed = selectedCategory !== category.name
    if (selectedCategory !== undefined && isCollapsed) return

    const renderer = (isDesktop || isTablet) ? 'renderCategoryDesktopTablet' : 'renderCategoryMobile'
    return (
      <tbody>
        {this[renderer](category)}
      </tbody>
    )
  }

  renderCategoryDesktopTablet (category) {
    const { t, selectedCategory, breakpoints: { isDesktop } } = this.props
    const { name, subcategories, credit, debit, percentage, currency, transactionsNumber } = category
    const isCollapsed = selectedCategory !== category.name
    return [
      <tr key={category.name} className={isCollapsed ? stRow : stUncollapsed} onClick={() => this.handleClick(category)}>
        <TdWithIcon className={cx(stCategory, styles[`bnk-table-category--${name}`])}>
          {t(`Data.categories.${name}`)}
        </TdWithIcon>
        <TdSecondary className={stPercentage}>
          {selectedCategory ? '100 %' : `${percentage} %`}
        </TdSecondary>
        <TdSecondary>{transactionsNumber}</TdSecondary>
        <TdSecondary className={stTotal}>
          <Figure total={credit + debit} currency={currency} coloredPositive signed />
        </TdSecondary>
        {isDesktop && <TdSecondary className={stAmount}>
          {credit ? <Figure total={credit} currency={currency} signed default='-' /> : '－'}
        </TdSecondary>}
        {isDesktop && <TdSecondary className={stAmount}>
          {debit ? <Figure total={debit} currency={currency} signed default='-' /> : '－'}
        </TdSecondary>}
        {isDesktop && <td className={stChevron} />}
      </tr>,
      ...(isCollapsed ? [] : subcategories.map(subcategory =>
        this.renderSubcategoryDesktopTablet(category, subcategory)))
    ]
  }

  renderSubcategoryDesktopTablet (category, subcategory) {
    const { t, breakpoints: { isDesktop } } = this.props
    const { name, currency, credit, debit, transactionsNumber, percentage } = subcategory
    return (
      <tr key={name} className={stRowSub} onClick={() => this.handleClick(category, subcategory)}>
        <TdWithIcon className={stCategory}>
          {t(`Data.subcategories.${name}`)}
        </TdWithIcon>
        <TdSecondary className={stPercentage}>{percentage} %</TdSecondary>
        <TdSecondary >{transactionsNumber}</TdSecondary>
        <TdSecondary className={stTotal}>
          <Figure total={credit + debit} currency={currency} signed />
        </TdSecondary>
        {isDesktop && <TdSecondary className={stAmount}>
          {credit ? <Figure total={credit} currency={currency} signed /> : '－'}
        </TdSecondary>}
        {isDesktop && <TdSecondary className={stAmount}>
          {debit ? <Figure total={debit} currency={currency} signed /> : '－'}
        </TdSecondary>}
        {isDesktop && <td className={stChevron} />}
      </tr>
    )
  }

  handleClick = (category, subcategory) => {
    const { router } = this.props
    if (subcategory) {
      router.push(`/categories/${category.name}/${subcategory.name}`)
    } else {
      this.toggle(category.name)
    }
  }

  renderCategoryMobile (category, subcategory) {
    const { t, selectedCategory } = this.props
    const { name, subcategories, credit, debit, currency, percentage } = (subcategory || category)

    // subcategories are always collapsed
    const isOpen = !subcategory && selectedCategory === category.name
    const tKey = subcategory ? 'subcategories' : 'categories'
    const categoryName = (subcategory || category).name

    const out = [
      <tr key={categoryName} className={isOpen ? stUncollapsed : (subcategory ? stRowSub : stRow)} onClick={() => this.handleClick(category, subcategory)}>
        <td className='u-ph-1 u-pv-half'>
          <Media>
            <Img className='u-pr-half' style={subcategory ? vHidden : null}>
              <CategoryIcon category={categoryName} style={!subcategory} />
            </Img>
            <Bd className={cx('u-ph-half', stCategory)}>
              {t(`Data.${tKey}.${name}`)}
            </Bd>
            <Img className={cx('u-pl-half', stPercentage)}>
              {selectedCategory ? '100 %' : `${percentage} %`}
            </Img>
            <Img className={cx('u-pl-1', stAmount)}>
              <Figure className={stCatTotalMobile} total={credit + debit} currency={currency} coloredPositive signed />
            </Img>
          </Media>
        </td>
      </tr>,
      ...(isOpen ? subcategories.map(subcategory => this.renderCategoryMobile(category, subcategory)) : [])
    ]

    return out
  }
}

export default compose(
  withRouter,
  breakpointsAware(),
  translate()
)(Categories)
