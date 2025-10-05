import React from 'react'
import { useFormik } from "formik"
import * as yup from "yup"

const AddAmenities = () => {
  // yup validation
  const basicSchema = yup.object().shape({
    name: yup
          .string()
          .max(25, "Amenity name must be less than 25 characters")
          .required("Input is required"),

    description: yup
                  .string()
                  .max(200, "Description must be less than 200 characters")
                  .required("Input is required")
  })

  const {values, errors, touched, handleChange, handleSubmit, handleBlur, resetForm} = useFormik({
    initialValues:{name: "", desription: ""},
    validationSchema: basicSchema,

    onSubmit: (formValues) => {
      fetch("/hotel/<int:hotel_id>/amenities", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formValues),
      })
      .then((r) => r.json())
      .then(()=>{
        resetForm()
      })
    }
  })

  function toTitleCase(str) {
    return str
      .toLowerCase() 
      .split(' ') 
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ')
  }

  return (
    <div>
        <h2>AddAmenities</h2>

        <form onsubmit={handleSubmit}>
          {["name", "description"].map((field)=>(  
              <div key={field}>
                <label htmlFor={field}>{toTitleCase(field)}</label>
                <br/>
                <input 
                  id={field}
                  className={errors[field] && touched[field]? 'input-error': ""}
                  name={field}
                  type="text"
                  value={values[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={`Enter ${toTitleCase(field)}`}
                />
                {errors[field] && touched[field] && <p className='error-msg'>{errors[field]}</p>}
                <br/>
              </div>
            ))}
            <button type='submit'>Add Amenity</button>
        </form>

    </div>
  )
}

export default AddAmenities