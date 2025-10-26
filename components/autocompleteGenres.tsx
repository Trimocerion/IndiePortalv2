import * as React from "react";
import { useEffect, useState } from "react";
import { AutocompleteGetTagProps } from "@mui/base/useAutocomplete";
import useAutocomplete from "@mui/material/useAutocomplete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { autocompleteClasses } from "@mui/material/Autocomplete";
import { supabase } from "../utility/supabaseClient";

const Root = styled("div")(
  ({ theme }) => `
  color: ${
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"
  };
  font-size: 14px;
`,
);

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div')(
    ({ theme }) => `
  width: 300px;
  border: 1px solid ${theme.palette.mode === 'dark' ? '#434343' : '#d9d9d9'};
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
  }

  &.focused {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
    color: ${
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'
    };
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`,
);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
    label: string;
}

/**
 * Renders a tag component with a label and a delete icon.
 * @param {TagProps} props - The props for the Tag component.
 * @returns {React.ReactElement} The rendered tag.
 */
function Tag(props: TagProps) {
    const { label, onDelete, ...other } = props;
    return (
        <div {...other}>
            <span>{label}</span>
            <CloseIcon  onClick={onDelete} />
        </div>
    );
}

const StyledTag = styled(Tag)<TagProps>(
    ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: ${
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fafafa'
    };
  border: 1px solid ${theme.palette.mode === 'dark' ? '#303030' : '#e8e8e8'};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
  }
`,
);

const Listbox = styled('ul')(
    ({ theme }) => `
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === 'dark' ? '#2b2b2b' : '#fafafa'};
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`,
);

/**
 * A customized autocomplete component for selecting genres.
 * @param {object} props - The props for the component.
 * @param {any[]} [props.genres] - The initial list of genres.
 * @param {(selectedGenres: string[]) => void} props.onSelectedGenresChange - Callback function for when selected genres change.
 * @returns {React.ReactElement} The rendered autocomplete component.
 */
export default function CustomizedHook({ genres, onSelectedGenresChange  }: { genres?: any[], onSelectedGenresChange: (selectedGenres: string[]) => void }) {
    const [options, setOptions] = useState<string[]>([]);
    const [selectedGameGenres, setSelectedGameGenres] = useState<string[]>([]);

    if(!genres) {
        genres = [];
    }


    useEffect(() => {
        if (genres && genres.length > 0) {
            setSelectedGameGenres(genres.map((genre) => genre.genre_name));
        }
    }, [genres]);

    const gameGenres = genres ? genres.map((genre: any) => genre.genre_name) : [];




    useState(() => {
        async function fetchData() {
            // Pobierz gatunki z tabeli genres
            const { data, error } = await supabase.from('genres').select('genre_name');
            if (error) {
                console.error('Error fetching genres:', error);
                return;
            }
            if (data) {
                const genreNames = data.map((genre: any) => genre.genre_name);
                setOptions(genreNames);
            }
        }
        fetchData();
    });

    const handleDelete = (deletedGenre: string) => {
        const updatedGenres = selectedGameGenres.filter(genre => genre !== deletedGenre);
        setSelectedGameGenres(updatedGenres);
        onSelectedGenresChange(updatedGenres);
        console.log('Selected genres:', updatedGenres);
    };

    const handleAdd = (newGenre: string) => {

        if(selectedGameGenres.includes(newGenre)) {
            return;
        }


        const updatedGenres = [...selectedGameGenres, newGenre];

        const uniqueGenres = updatedGenres.filter((genre, index) => updatedGenres.indexOf(genre) === index);

        setSelectedGameGenres(uniqueGenres);
        onSelectedGenresChange(updatedGenres);

        console.log('Selected genres:', updatedGenres);
    };

    const {
        getRootProps,
        getInputLabelProps,
        getInputProps,
        getTagProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        value,
        focused,
        setAnchorEl,
    } = useAutocomplete({
        id: 'customized-hook-demo',
        defaultValue: gameGenres,
        value: selectedGameGenres,
        multiple: true,
        options,
    });

    return (
        <Root>
            <div {...getRootProps()}>
                <Label {...getInputLabelProps()}>Genres</Label>
                <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''} sx={{width:'100%'}}>
                    {value.map((genre: any, index: number) => (
                        // eslint-disable-next-line react/jsx-key
                        <StyledTag
                            label={genre}
                            {...getTagProps({ index })}
                            key={index}
                            onDelete={() => handleDelete(genre)}
                        />
                    ))}
                    <input {...getInputProps()} />
                </InputWrapper>
            </div>
            {groupedOptions.length > 0 ? (
                <Listbox {...getListboxProps()}>
                    {(groupedOptions as typeof options).map((option, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <li
                            {...getOptionProps({ option, index })}
                            onClick={() => handleAdd(option)}

                        >
                            <span>{option}</span>
                            <CheckIcon fontSize="small" />
                        </li>
                    ))}
                </Listbox>
            ) : null}
        </Root>
    );
}
