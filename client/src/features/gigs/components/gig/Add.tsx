import { ChangeEvent, FC, ReactElement, useEffect, useState, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import Button from 'src/shared/button/Button';
import Dropdown from 'src/shared/dropdown/Dropdown';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import TextInput from 'src/shared/inputs/TextInput';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { GIG_MAX_LENGTH, IAllowedGigItem, ICreateGig } from '../../interfaces/gig.interface';
import ReactQuill from 'react-quill-new';
import { categories, expectedGigDelivery, reactQuillUtils } from 'src/shared/utils/utils.service';
import TagsInput from './components/TagsInput';

type QuillEditor = Parameters<NonNullable<React.ComponentProps<typeof ReactQuill>['onChange']>>[3];

const defaultGigInfo: ICreateGig = {
  title: '',
  categories: '',
  description: '',
  subCategories: [],
  tags: [],
  price: 0,
  coverImage: 'https://placehold.co/330x220?text=Cover+Image',
  expectedDelivery: 'Expected Delivery',
  basicTitle: '',
  basicDescription: ''
};

const AddGig: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  const [gigInfo, setGigInfo] = useState<ICreateGig>(defaultGigInfo);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [subCategoryInput, setSubCategoryInput] = useState<string>('');

  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState<string>('');

  const reactQuillRef = useRef<ReactQuill | null>(null);

  const [allowedGigItemLength, setAllowedGigItemLength] = useState<IAllowedGigItem>({
    gigTitle: '80/80',
    basicTitle: '40/40',
    basicDescription: '100/100',
    descriptionCharacters: '1200/1200'
  });

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const timer = setTimeout(() => {
      const quill = reactQuillRef.current;
      if (!quill) return;
      try {
        const editor = quill.getEditor();
        const handler = () => {
          if (editor.getLength() > GIG_MAX_LENGTH.fullDescription) {
            editor.deleteText(GIG_MAX_LENGTH.fullDescription, editor.getLength());
          }
        };
        editor.on('text-change', handler);
        cleanup = () => editor.off('text-change', handler);
      } catch {
        // Editor not ready yet
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      cleanup?.();
    };
  }, []);

  return (
    <div className="relative w-screen">
      <Breadcrumb breadCrumbItems={['Seller', 'Create new gig']} />
      <div className="container relative mx-auto my-5 px-2 pb-12 md:px-0">
        {/* <!-- CircularPageLoader --> */}
        {!authUser.emailVerified && (
          <div className="absolute left-0 top-0 z-[80] flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
            <span className="mt-40">Please verify your email.</span>
          </div>
        )}

        <div className="border-grey left-0 top-0 z-10 mt-4 block rounded border bg-white p-6">
          <div className="mb-6 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Gig title<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="col-span-4 md:w-11/12 lg:w-8/12">
              <TextInput
                className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                type="text"
                name="gigTitle"
                value={gigInfo.title}
                placeholder="I will build something I'm good at."
                maxLength={80}
                onChange={(e: ChangeEvent) => {
                  const gigTitleValue: string = (e.target as HTMLInputElement).value;
                  setGigInfo({ ...gigInfo, title: gigTitleValue });
                  const counter: number = GIG_MAX_LENGTH.gigTitle - gigTitleValue.length;
                  setAllowedGigItemLength({ ...allowedGigItemLength, gigTitle: `${counter}/${GIG_MAX_LENGTH.gigTitle}` });
                }}
              />
              <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.gigTitle} Characters</span>
            </div>
          </div>
          <div className="mb-6 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Basic title<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="col-span-4 md:w-11/12 lg:w-8/12">
              <TextInput
                className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                placeholder="Write what exactly you'll do in short."
                type="text"
                name="basicTitle"
                value={gigInfo.basicTitle}
                maxLength={40}
                onChange={(e: ChangeEvent) => {
                  const basicTitleValue: string = (e.target as HTMLInputElement).value;
                  setGigInfo({ ...gigInfo, basicTitle: basicTitleValue });
                  const counter: number = GIG_MAX_LENGTH.basicTitle - basicTitleValue.length;
                  setAllowedGigItemLength({ ...allowedGigItemLength, basicTitle: `${counter}/${GIG_MAX_LENGTH.basicTitle}` });
                }}
              />
              <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.basicTitle} Characters</span>
            </div>
          </div>
          <div className="mb-6 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Brief description<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="col-span-4 md:w-11/12 lg:w-8/12">
              <TextAreaInput
                className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                placeholder="Write a brief description..."
                name="basicDescription"
                value={gigInfo.basicDescription}
                onChange={(e: ChangeEvent) => {
                  const basicDescriptionValue: string = (e.target as HTMLTextAreaElement).value;
                  setGigInfo({ ...gigInfo, basicDescription: basicDescriptionValue });
                  const counter: number = GIG_MAX_LENGTH.basicDescription - basicDescriptionValue.length;
                  setAllowedGigItemLength({ ...allowedGigItemLength, basicDescription: `${counter}/${GIG_MAX_LENGTH.basicDescription}` });
                }}
                rows={5}
                maxLength={100}
              />
              <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.basicDescription} Characters</span>
            </div>
          </div>
          <div className="mb-6 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Full description<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="col-span-4 md:w-11/12 lg:w-8/12">
              <ReactQuill
                theme="snow"
                value={gigInfo.description}
                modules={reactQuillUtils().modules}
                formats={reactQuillUtils().formats}
                ref={reactQuillRef}
                onChange={(event: string, _: unknown, __: unknown, editor: QuillEditor) => {
                  setGigInfo({ ...gigInfo, description: event });
                  const counter: number = GIG_MAX_LENGTH.fullDescription - editor.getText().length;
                  setAllowedGigItemLength({
                    ...allowedGigItemLength,
                    descriptionCharacters: `${counter}/${GIG_MAX_LENGTH.fullDescription}`
                  });
                }}
                className="border-grey border rounded"
              />
              <span className="flex justify-end text-xs text-[#95979d]">{allowedGigItemLength.descriptionCharacters} Characters</span>
            </div>
          </div>
          <div className="relative zIndexDropdown mb-12 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Category<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
              <Dropdown
                onClick={(item: string) => {
                  setGigInfo({ ...gigInfo, categories: item });
                }}
                text={gigInfo.categories}
                maxHeight="300"
                mainClassNames="absolute zIndexDropdown bg-white"
                values={categories()}
              />
            </div>
          </div>

          <TagsInput
            title="SubCategory"
            placeholder="E.g Website Development, Mobile App."
            gigInfo={gigInfo}
            setGigInfo={setGigInfo}
            itemInput={subCategoryInput}
            tags={subCategory}
            itemName="subCategories"
            counterText="Subcategories"
            setItem={setSubCategory}
            setItemInput={setSubCategoryInput}
            inputErrorMessage={false}
          />

          <TagsInput
            title="Tags"
            placeholder="Enter search terms for your gig."
            gigInfo={gigInfo}
            setGigInfo={setGigInfo}
            itemInput={tagsInput}
            tags={tags}
            itemName="tags"
            counterText="Tags"
            setItem={setTags}
            setItemInput={setTagsInput}
            inputErrorMessage={false}
          />

          <div className="mb-6 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Price<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="col-span-4 md:w-11/12 lg:w-8/12">
              <TextInput
                type="number"
                className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                placeholder="Enter minimum price"
                name="price"
                value={`${gigInfo.price}`}
                onChange={(event: ChangeEvent) => {
                  const value: string = (event.target as HTMLInputElement).value;
                  setGigInfo({ ...gigInfo, price: parseInt(value) > 0 ? parseInt(value) : 0 });
                }}
              />
            </div>
          </div>
          <div className="mb-12 grid md:grid-cols-5">
            <div className="pb-2 text-base font-medium">
              Expected delivery<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="relative col-span-4 md:w-11/12 lg:w-8/12">
              <Dropdown
                text={gigInfo.expectedDelivery}
                onClick={(item: string) => {
                  setGigInfo({ ...gigInfo, expectedDelivery: item });
                }}
                maxHeight="300"
                mainClassNames="absolute bg-white z-40"
                values={expectedGigDelivery()}
              />
            </div>
          </div>
          <div className="mb-6 grid md:grid-cols-5">
            <div className="mt-6 pb-2 text-base font-medium lg:mt-0">
              Cover image<sup className="top-[-0.3em] text-base text-red-500">*</sup>
            </div>
            <div className="relative col-span-4 cursor-pointer md:w-11/12 lg:w-8/12">
              <img
                src="https://placehold.co/330x220?text=Profile+Image"
                alt="Cover Image"
                className="left-0 top-0 h-[220px] w-[320px] bg-white object-cover"
              />
              <div className="left-0 top-0 flex h-[220px] w-[320px] cursor-pointer justify-center bg-[#dee1e7]"></div>
              <div className="absolute left-0 top-0 flex h-[220px] w-[320px] cursor-pointer justify-center bg-[#dee1e7]">
                <FaCamera className="flex self-center" />
              </div>
              <TextInput name="image" type="file" />
            </div>
          </div>
          <div className="grid xs:grid-cols-1 md:grid-cols-5">
            <div className="pb-2 text-base font-medium lg:mt-0"></div>
            <div className="col-span-4 flex gap-x-4 md:w-11/12 lg:w-8/12">
              <Button
                disabled={false}
                className="rounded bg-sky-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-3 md:text-base"
                label="Create Gig"
              />
              <Button
                disabled={false}
                className="rounded bg-red-500 px-8 py-3 text-center text-sm font-bold text-white hover:bg-red-400 focus:outline-none md:py-3 md:text-base"
                label="Cancel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGig;
