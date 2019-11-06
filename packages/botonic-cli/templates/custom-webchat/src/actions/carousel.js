import React from 'react'
import {
  Button,
  Carousel,
  Element,
  Pic,
  RequestContext,
  Title,
  Subtitle,
} from '@botonic/react'

export default class extends React.Component {
  static contextType = RequestContext

  render() {
    return (
      <Carousel typing={1}>
        <Element>
          <Pic
            src={
              'https://previews.123rf.com/images/benjamas154/benjamas1541508/benjamas154150800054/43992916-sewing-buttons-plastic-buttons-colorful-buttons-background-buttons-close-up-buttons-background.jpg'
            }
          />
          <Title>Buttons</Title>
          <Subtitle>Buttons</Subtitle>
          <Button payload={'buttons'}>Buttons</Button>
        </Element>
        <Element>
          <Pic
            src={
              'https://www.firetext.co.uk/sites/default/files/images/features/thumbnail/replies.png'
            }
          />
          <Title>Replies</Title>
          <Subtitle>Replies</Subtitle>
          <Button payload={'replies'}>Replies</Button>
        </Element>
      </Carousel>
    )
  }
}
