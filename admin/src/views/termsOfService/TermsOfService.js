import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import { Box, Button, Fab, FormGroup, Grid, Stack, Typography } from '@mui/material'
import { IconEdit, IconUpload } from '@tabler/icons'
import PageService from '../../services/pages.service'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useParams } from 'react-router'

const Privacy = () => {
  const privacyPageId = 'terms-and-condition'
  const params = useParams()
  const [ loading, setLoading ] = useState(true)
  const [ description, setDescription ] = useState('')
  const [ isUpdateMode, setIsUpdateMode ] = useState(false)

  useEffect(() => {
    getPage()
  }, [ params ])

  async function getPage() {
    try {
      setLoading(true)
      const response = await PageService.fetchPage(privacyPageId)
      setDescription(response?.description)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateDescription() {
    try {
      setLoading(true)
      const res = await PageService.updatePage(privacyPageId, description)
      setDescription(res?.description)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
      <MainCard title="Terms Of Service">
        {loading ? (
            <Typography variant="body2">Loading...</Typography>
        ) : (
            <Grid item xs={12} sx={{ overflowX: 'scroll' }}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Fab
                    sx={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      color: '#5e35b1',
                      backgroundColor: 'white',
                      boxShadow: '2px 4px 10px rgb(211, 210, 213)',
                      border: '1px solid rgb(94,53,177)'
                    }}
                    onClick={() => setIsUpdateMode((prevState) => !prevState)}
                >
                  <IconEdit stroke={1.5} size="1.3rem"/>
                </Fab>
              </Grid>
              <Box noValidate autoComplete="off" component="form" sx={{ '& .MuiTextField-root': { my: 2, width: '100%' } }}>
                <Grid item container xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormGroup>
                    <Grid item xs={12} className="App" marginY={2}>
                      <CKEditor
                          onReady={(editor) => {
                            editor.editing.view.change((writer) => {
                              writer.setStyle('min-height', '550px', editor.editing.view.document.getRoot())
                              writer.setStyle('max-height', '550px', editor.editing.view.document.getRoot())
                            })
                          }}
                          disabled={!isUpdateMode}
                          editor={ClassicEditor}
                          data={description}
                          value={description}
                          onChange={(event, editor) => {
                            const data = editor.getData()
                            setDescription(data)
                          }}
                      />
                    </Grid>
                    {isUpdateMode ? (
                        <Grid item xs={12} my={2}>
                          <Stack direction="row" justifyContent="flex-start" marginLeft="15px">
                            <Button variant="contained" color="success" onClick={() => updateDescription()}>
                              <IconUpload stroke={1.5} size="1.3rem"/>
                              Update Privacy
                            </Button>
                          </Stack>
                        </Grid>
                    ) : null}
                  </FormGroup>
                </Grid>
              </Box>
            </Grid>
        )}
      </MainCard>

  )
}

export default Privacy
