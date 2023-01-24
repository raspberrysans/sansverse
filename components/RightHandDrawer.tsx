import * as React from 'react'
import { Block, ExtendedRecordMap } from 'notion-types'
import styles from './RightHandDrawer.module.css'

export const RightHandDrawer: React.FC<{
  block: Block
  recordMap?: ExtendedRecordMap
  isBlogPost: boolean
}> = ({
  block,
  // recordMap,
  isBlogPost
}) => {
  if (!block) {
    return null
  }

  if (isBlogPost) {
    return (
      <div className={styles.drawerWrapper}>
        <h1>sans hi</h1>
      </div>
    )
  }
}
