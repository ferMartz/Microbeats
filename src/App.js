import React from 'react'
import connect from 'refunk'
import { compose, mapProps } from 'recompose'
import { ThemeProvider } from 'styled-components'
import hhmmss from 'hhmmss'
import { format } from 'date-fns'
import theme from '../theme'
import withAudio from './withAudio'
import Keyboard from './Keyboard'
import Style from './Style'
import Icon from './Icon'

// lab
import Box from './ui/Box'
import Flex from './ui/Flex'
import Container from './ui/Container'
import Position from './ui/Position'
import TruncatedHeading from './ui/TruncatedHeading'
import Text from './ui/Text'
import Button from './ui/Button'
import CircleButton from './ui/CircleButton'
import Progress from './ui/Progress'
import Link from './ui/Link'

const setIndex = index => state => ({ index })

const hoc = compose(
  connect,
  mapProps(props => ({
    ...props,
    track: props.tracks[props.index % props.tracks.length]
  })),
  withAudio
)

const sorts = {
  reverse: (a, b) => new Date(b.date) - new Date(a.date),
  chronological: (a, b) => new Date(a.date) - new Date(b.date),
}

class Catch extends React.Component {
  constructor () {
    super()
    this.state = {
      err: null
    }
  }

  componentDidCatch (err) {
    this.setState({ err })
  }

  componentWillReceiveProps () {
    this.setState({ err: false })
  }

  render () {
    if (this.state.err) return false
    if (!this.props.children) return false
    return React.Children.only(this.props.children)
  }
}

const App = hoc(props => [
  // !!props.styles && <Catch><div dangerouslySetInnerHTML={{ __html: props.styles }} /></Catch>,
  !!props.styles && <div dangerouslySetInnerHTML={{ __html: props.styles }} />,
  <title>microbeats</title>,
  <meta name='viewport' content='width=device-width,initial-scale=1' />,
  <meta name='description' content='Beats created in under an hour' />,
  <meta name='twitter:card' content='summary' />,
  <meta name='twitter:site' content='@jxnblk' />,
  <meta name='twitter:title' content='microbeats' />,
  <meta name='twitter:description' content='Beats created in under an hour' />,
  <meta name='twitter:image' content='apple-touch-icon.png' />,
  <Style key='basestyle' css={props.css} />,
  <ThemeProvider theme={theme}>
    <Container>
      <Keyboard {...props} />
      <Position
        width={1}
        position='fixed'
        height='96px'
        bg='white'
        top right left>
        <Container py={2}>
          <header>
            <Flex w={1} align='center'>
              <CircleButton
                onClick={e => props.playPause()}>
                <Icon name={props.playing ? 'pause' : 'play'} />
              </CircleButton>
              <Box px={2}>
                <Flex align='baseline'>
                  <Text fontSize={0}>microbeats</Text>
                  <Text ml={4} fontSize='8px'>{hhmmss(props.currentTime)}</Text>
                </Flex>
                <TruncatedHeading fontSize={3}>
                  {props.track && props.track.title}
                </TruncatedHeading>
              </Box>
              <CircleButton ml='auto' onClick={e => props.previous()}>
                <Icon name='previous' />
              </CircleButton>
              <CircleButton onClick={e => props.next()}>
                <Icon name='next' />
              </CircleButton>
            </Flex>
            <Box px={3}>
              <Progress
                mt={2}
                onClick={e => {
                  const n = e.clientX - e.target.offsetLeft
                  const p = n / e.target.offsetWidth
                  props.seek(p)
                }}
                value={props.currentTime / props.duration}
              />
            </Box>
          </header>
        </Container>
      </Position>
      <Box py={96}>
        <Box px={3} pt={4} width={[ 1, null, null, 1024 ]}>
          <Text fontSize={4}>
            Microbeats is an experiment in music production emphasizing quantity over quality.
            All beats are created by Jxnblk in under an hour and not mixed down or mastered.
          </Text>
        </Box>
        <Flex
          align='center'
          px={3}
          pt={2}
          pb={4}
          fontSize={0}>
          <Box mx='auto' />
          <label>Sort</label>
          <Box ml={1} />
          <select
            value={props.sort}
            onChange={e => {
              const { value } = e.target
              props.update({ sort: value })
            }}
          >
            <option value='reverse'>Reverse</option>
            <option value='chronological'>Chronological</option>
          </select>
        </Flex>
        {props.tracks
          .sort(sorts[props.sort])
          .map((track, i) => (
          <Box key={track._id} id={track.name}>
            <Button
              width={1}
              py={3}
              px={3}
              onClick={e => {
                props.update(setIndex(i))
                if (props.index === i && !props.playing) {
                  props.play()
                }
              }}>
              <Flex align='center'>
                <Text mr={3}>
                  {track.title}
                </Text>
                <Box width={20}>
                  {props.index === i && <Icon name='volume' size={16} />}
                </Box>
                <Text ml='auto' fontSize={[ '8px', '10px' ]}>
                  {format(track.date, 'MMM D, YYYY')}
                </Text>
              </Flex>
            </Button>
          </Box>
        ))}
      </Box>
      <footer>
        <Flex wrap px={3} py={4}>
          <Link href='https://compositor.io' mr={3} my={3}>
            Built with Compositor
          </Link>
          <Link href='http://jxnblk.com' mr={3} my={3}>
            Made by Jxnblk
          </Link>
          <Link href='https://github.com/jxnblk/Microbeats' mr={3} my={3}>
            GitHub
          </Link>
        </Flex>
      </footer>
    </Container>
  </ThemeProvider>,
  <script async src='https://www.googletagmanager.com/gtag/js?id=UA-4603832-10' />,
  <script dangerouslySetInnerHTML={{ __html: ga }} />
])

App.defaultProps = {
  tracks: [],
  index: 0,
  playing: false,
  currentTime: 0,
  duration: 0,
  sort: 'reverse'
}

App.getInitialProps = async ({ Component, props }) => {
  const fetch = require('isomorphic-fetch')
  const res = await fetch('https://microbeats.now.sh/tracks')
  const json = await res.json()
  const tracks = json.sort(sorts.reverse)

  const { ServerStyleSheet } = require('styled-components')
  const sheet = new ServerStyleSheet()
  sheet.collectStyles(<Component {...props} tracks={tracks} />)
  const styles = sheet.getStyleTags()

  return {
    tracks,
    styles
  }
}

const ga = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-4603832-10');
`

export default App
