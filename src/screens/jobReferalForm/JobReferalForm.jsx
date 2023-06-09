import React, { useReducer, useEffect } from 'react';
import { useAuth, useJobContext } from '../../contexts';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Flex,
  Button,
  Select,
  Box,
  Text,
  Checkbox,
  Heading,
  useColorMode,
} from '@chakra-ui/react';
import Creatable from 'react-select/creatable';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const options = [
  { value: 'Javscript', label: 'Javscript' },
  { value: 'React', label: 'React' },
  { value: 'Html', label: 'Html' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Vuejs', label: 'Vuejs' },
  { value: 'C++', label: 'C++' },
  { value: 'C', label: 'C' },
  { value: 'Python', label: 'Python' },
  { value: 'NextJs', label: 'NextJs' },
  { value: 'Tailwind', label: 'Tailwind' },
  { value: 'Git', label: 'Git' },
];

function JobReferalForm() {
  const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      color: 'gray',
    }),
    control: (provided, state) => ({
      ...provided,
      color: 'gray',
    }),
    input: provided => ({
      ...provided,
      color: 'var(--text-color)',
    }),
  };
  const {
    state: { user },
  } = useAuth();
  const { jobID } = useParams();
  const navigate = useNavigate();
  const { setJobsData } = useJobContext();

  useEffect(() => {
    (async () => {
      const collectionRef = await doc(db, 'Jobs', jobID);
      const unsb = onSnapshot(collectionRef, doc => {
        jobDispatch({
          type: 'SET_JOB_STATE',
          payload: doc.data(),
        });
      });
    })();
  }, [jobID]);

  const initialiState = {
    company_name: '',
    isRemote: false,
    job_description: '',
    job_role: '',
    location: '',
    uid: user?.uid || '',
    skills: [],
    appliedBy: [],
  };
  const jobReducer = (state, action) => {
    switch (action.type) {
      case 'SET_COMPANY_NAME': {
        return { ...state, company_name: action.payload };
      }
      case 'SET_IS_REMOTE': {
        return { ...state, isRemote: action.payload };
      }
      case 'SET_JOB_DESCRIPTION': {
        return {
          ...state,
          job_description: action.payload,
        };
      }
      case 'SET_JOB_ROLE': {
        return {
          ...state,
          job_role: action.payload,
        };
      }
      case 'SET_LOACTION': {
        return {
          ...state,
          location: action.payload,
        };
      }
      case 'SET_UID': {
        return {
          ...state,
          uid: action.payload,
        };
      }
      case 'SET_SKILLS': {
        return { ...state, skills: [...action.payload] };
      }
      case 'SET_JOB_STATE': {
        return { ...action.payload };
      }
      default:
        return state;
    }
  };
  const [jobState, jobDispatch] = useReducer(jobReducer, initialiState);

  async function handleSubmit(e) {
    if (jobID === undefined) {
      try {
        const docRef = await addDoc(collection(db, 'Jobs'), {
          ...jobState,
        });
        const collectionRef = collection(db, 'Jobs');
        getDocs(collectionRef).then(snapshot => {
          const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          }));
          setJobsData([...newData]);
        });
        navigate('/');
        toast.success('Job added Successfully', {
          position: 'bottom-right',
          autoClose: 2000,
        });
      } catch (e) {
        console.error('Error adding document: ', e);
        toast.error('Error adding Job', {
          position: 'bottom-right',
          autoClose: 2000,
        });
      }
    } else {
      try {
        const collectionRef = await doc(db, 'Jobs', jobID);
        updateDoc(collectionRef, {
          ...jobState,
        });

        const collectionRefJobs = collection(db, 'Jobs');
        getDocs(collectionRefJobs).then(snapshot => {
          const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          }));
          setJobsData([...newData]);
        });
        navigate('/');
        toast.success('Job Updated Successfully', {
          position: 'bottom-right',
          autoClose: 2000,
        });
      } catch (err) {
        console.error(err);
        toast.error('Error Updating Job', {
          position: 'bottom-right',
          autoClose: 2000,
        });
      }
    }
  }

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      gap={5}
      p={{ base: '2' }}
      h="calc(100vh)"
    >
      <Heading>Referral Form</Heading>
      <Text>
        Want to give a referral? Fill out the following form by entering the job
        details you can give referral for.
      </Text>
      <FormControl
        isRequired
        width={{ base: '100%', md: '50%', xl: '25%' }}
        boxShadow="base"
        p="6"
      >
        <FormLabel htmlFor="role">
          Select the Role you are looking for
        </FormLabel>
        <Select
          id="role"
          placeholder="Select Role"
          required
          value={jobState.job_role}
          onChange={e => {
            jobDispatch({ type: 'SET_JOB_ROLE', payload: e.target.value });
          }}
        >
          <option>Full-Stack Web Developer</option>
          <option>Front-End Developer</option>
          <option>Back-End Developer</option>
        </Select>
        <FormLabel htmlFor="companyName" mt="2" required>
          Please enter your Company Name
        </FormLabel>
        <Input
          id="companyName"
          type="text"
          value={jobState.company_name}
          onChange={e => {
            jobDispatch({
              type: 'SET_COMPANY_NAME',
              payload: e.target.value,
            });
          }}
        />
        <Textarea
          placeholder="Enter The Job Description Here"
          my="4"
          value={jobState.job_description}
          onChange={e => {
            jobDispatch({
              type: 'SET_JOB_DESCRIPTION',
              payload: e.target.value,
            });
          }}
        />
        <FormLabel htmlFor="role">Please Enter the Location</FormLabel>
        <Input
          id="location"
          type="location"
          value={jobState.location}
          onChange={e => {
            jobDispatch({
              type: 'SET_LOACTION',
              payload: e.target.value,
            });
          }}
        />
        <FormLabel as="legend" my="2">
          Candidate can work remotely ?
        </FormLabel>
        <Checkbox
          size="md"
          isChecked={jobState?.isRemote}
          colorScheme="teal"
          onChange={e => {
            jobDispatch({
              type: 'SET_IS_REMOTE',
              payload: e.target.checked,
            });
          }}
        >
          Yes
        </Checkbox>
        <Text htmlFor="skills" mt="2">
          Please select the skills required
        </Text>
        <Box my="2">
          <Creatable
            styles={customStyles}
            my="2"
            defaultValue={
              jobState?.skills?.length > 0
                ? jobState?.skills?.map(value => ({
                    value: value,
                    label: value,
                  }))
                : []
            }
            onChange={value =>
              jobDispatch({
                type: 'SET_SKILLS',
                payload: value.map(item => item.value),
              })
            }
            options={options}
            isMulti={true}
            placeholder="Skills..."
          />
        </Box>
        <Flex justifyContent="space-between" p="1" mt="2">
          <NavLink to="/profile">
            <Button colorScheme="purple" type="submit">
              Cancel
            </Button>
          </NavLink>
          <Button colorScheme="purple" type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </Flex>
      </FormControl>
    </Flex>
  );
}

export { JobReferalForm };
