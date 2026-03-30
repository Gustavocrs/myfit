import {IMaskInput} from "react-imask";
import {useState, useEffect, useRef, useMemo} from "react";
import {FiEye, FiEyeOff, FiChevronDown, FiX} from "react-icons/fi";
import {Autocomplete, TextField, Chip} from "@mui/material";

export const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  data = [],
  placeholder,
  disabled = false,
  required = false,
  className = "",
  textAreaRows = "4",
  textAreaMaxLength = "320",
  multiple = false,
  freeSolo = false,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const getLabel = (item) => {
        if (typeof item === "object" && item !== null) {
          const val =
            item.value ??
            item._id ??
            item.nome ??
            item.label ??
            JSON.stringify(item);
          return item.label ?? item.nome ?? val;
        }
        return String(item);
      };
      return String(getLabel(a)).localeCompare(String(getLabel(b)), "pt-BR", {
        sensitivity: "base",
      });
    });
  }, [data]);

  const baseInputClasses = `
    block w-full h-14 px-4 py-2 font-sans
    border border-slate-300 dark:border-slate-600 rounded-lg
    bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
    disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed
  `;

  const inputType = type === "password" && passwordVisible ? "text" : type;

  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <select
            className={`${baseInputClasses} ${className}`}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
          >
            <option value="">{placeholder || "Selecione uma opção"}</option>
            {sortedData.map((item, index) => {
              if (typeof item === "object") {
                const val =
                  item.value ??
                  item._id ??
                  item.nome ??
                  item.label ??
                  JSON.stringify(item);
                const label = item.label ?? item.nome ?? val;
                const cargaH = item.cargaHoraria;
                return (
                  <option key={val} value={val}>
                    {label}
                    {cargaH ? ` - ${cargaH}h` : ""}
                  </option>
                );
              }
              return (
                <option key={String(item)} value={item}>
                  {String(item)}
                </option>
              );
            })}
          </select>
        );
      case "multiselect":
        const selectedValues = Array.isArray(value)
          ? value
          : value
            ? [value]
            : [];

        const getPrimitiveValue = (v) => {
          if (typeof v === "object" && v !== null) {
            return v.value ?? v._id ?? v.nome ?? v.label ?? JSON.stringify(v);
          }
          return v;
        };

        const handleMultiSelect = (val) => {
          const exists = selectedValues.some(
            (v) => String(getPrimitiveValue(v)) === String(val),
          );

          const newValues = exists
            ? selectedValues.filter(
                (v) => String(getPrimitiveValue(v)) !== String(val),
              )
            : [...selectedValues, val];

          onChange({
            target: {
              name,
              value: newValues,
            },
          });
        };

        const getOptionLabel = (val) => {
          if (typeof val === "object" && val !== null) {
            return val.label ?? val.nome ?? val.value ?? JSON.stringify(val);
          }

          const option = data.find((item) => {
            const itemVal = getPrimitiveValue(item);
            return String(itemVal) === String(val);
          });

          if (option) {
            return typeof option === "object"
              ? (option.label ?? option.nome ?? val)
              : option;
          }
          return val;
        };

        return (
          <div className="relative" ref={dropdownRef}>
            <div
              className={`${baseInputClasses} ${className} h-auto min-h-[3.5rem] flex flex-wrap items-center gap-2 cursor-pointer`}
              onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
            >
              {selectedValues.length > 0 ? (
                selectedValues.map((val) => {
                  const primitiveVal = getPrimitiveValue(val);
                  return (
                    <span
                      key={primitiveVal}
                      className="bg-sky-100 text-sky-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {getOptionLabel(val)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMultiSelect(primitiveVal);
                        }}
                        className="text-orange-700 hover:text-orange-400 flex-shrink-0"
                      >
                        <FiX className="font-black" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  {placeholder || "Selecione..."}
                </span>
              )}
              <div className="ml-auto">
                <FiChevronDown
                  className={`text-slate-500 dark:text-slate-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {dropdownOpen && !disabled && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {sortedData
                  .filter((item) => {
                    const val = getPrimitiveValue(item);
                    return !selectedValues.some(
                      (sv) => String(getPrimitiveValue(sv)) === String(val),
                    );
                  })
                  .map((item) => {
                    const val = getPrimitiveValue(item);
                    const label =
                      typeof item === "object"
                        ? (item.label ?? item.nome ?? val)
                        : item;

                    return (
                      <div
                        key={String(val)}
                        className="px-4 py-2 cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                        onClick={() => handleMultiSelect(val)}
                      >
                        <input className="cursor-pointer" type="checkbox" />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                {sortedData.filter((item) => {
                  const val = getPrimitiveValue(item);
                  return !selectedValues.some(
                    (sv) => String(getPrimitiveValue(sv)) === String(val),
                  );
                }).length === 0 && (
                  <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                    Nenhuma opção disponível
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "autocomplete":
        return (
          <Autocomplete
            multiple={multiple}
            freeSolo={freeSolo}
            options={sortedData}
            filterSelectedOptions
            autoHighlight
            autoSelect
            value={(() => {
              const resolveVal = (v) => {
                if (v === null || v === undefined || v === "") return null;
                if (typeof v === "object") return v;
                const found = sortedData.find((item) => {
                  const itemVal =
                    typeof item === "object"
                      ? (item.value ??
                        item._id ??
                        item.nome ??
                        item.label ??
                        item)
                      : item;
                  return String(itemVal) === String(v);
                });
                return found || v;
              };

              if (multiple) {
                return Array.isArray(value)
                  ? value.map(resolveVal).filter((v) => v !== null)
                  : [];
              }
              return resolveVal(value);
            })()}
            onChange={(e, newValue) => {
              const sanitizedValue =
                multiple && Array.isArray(newValue)
                  ? newValue.map((v) =>
                      typeof v === "object" && v !== null
                        ? (v.value ?? v._id ?? v.nome ?? v.label ?? v)
                        : v,
                    )
                  : newValue;
              onChange({
                target: {
                  name,
                  value: sanitizedValue,
                },
              });
            }}
            disabled={disabled}
            disableCloseOnSelect={multiple}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;
              return option.label ?? option.nome ?? option.value ?? "";
            }}
            isOptionEqualToValue={(option, val) => {
              const getVal = (item) =>
                typeof item === "object"
                  ? (item.value ?? item._id ?? item.nome ?? item.label ?? item)
                  : item;
              return String(getVal(option)) === String(getVal(val));
            }}
            renderTags={(tagValue, getTagProps) => (
              <div className="flex flex-wrap gap-2 w-full max-h-20 overflow-y-auto">
                {tagValue.map((option, index) => {
                  const label =
                    typeof option === "string"
                      ? option
                      : (option.label ?? option.nome ?? option.value ?? "");
                  const {key, ...tagProps} = getTagProps({index});
                  return (
                    <Chip
                      key={key}
                      label={label}
                      {...tagProps}
                      size="small"
                      deleteIcon={<FiX className="font-black" />}
                      sx={{
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        borderRadius: "0.375rem",
                        "& .MuiChip-deleteIcon": {
                          color: "#c2410c",
                          flexShrink: 0,
                          "&:hover": {
                            color: "#fb923c",
                          },
                        },
                      }}
                    />
                  );
                })}
              </div>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={
                  placeholder || "Selecione ou digite e pressione Enter..."
                }
                required={
                  required &&
                  (!value || (Array.isArray(value) && value.length === 0))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: "9px",
                    width: "100%",
                    maxWidth: "100%",
                    height: multiple ? "auto" : "3.5rem",
                    minHeight: multiple ? "8rem" : "3.5rem",
                    alignItems: multiple ? "flex-start" : "center",
                    overflow: "hidden",
                    backgroundColor: "var(--mui-input-bg, white)",
                    borderRadius: "0.5rem",
                    "& fieldset": {
                      borderColor: "var(--mui-input-border, #cbd5e1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--mui-input-border, #cbd5e1)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0ea5e9",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiAutocomplete-inputRoot": {
                    alignItems: multiple ? "flex-start" : "center",
                  },
                  "& .MuiInputBase-input": {
                    color: "var(--mui-input-color, #0f172a)",
                    "&::placeholder": {
                      fontSize: "0.875rem",
                      color: "var(--mui-input-placeholder, #64748b)",
                      opacity: 1,
                    },
                  },
                }}
              />
            )}
            className={className}
          />
        );
      case "textarea":
        return (
          <textarea
            className={`${baseInputClasses} ${className} h-auto py-3`}
            placeholder={placeholder || label}
            name={name}
            value={value}
            onChange={onChange}
            rows={textAreaRows}
            disabled={disabled}
            required={required}
            maxLength={textAreaMaxLength}
          />
        );
      case "cpf":
      case "cel":
      case "cep":
        const maskToUse =
          type === "cpf"
            ? "000.000.000-00"
            : type === "cep"
              ? "00000-000"
              : "(00) 00000-0000";
        return (
          <IMaskInput
            mask={maskToUse}
            value={value}
            onAccept={(val) =>
              onChange({
                target: {
                  name,
                  value: type === "cep" ? val.replace(/\D/g, "") : val,
                },
              })
            }
            disabled={disabled}
            className={`${baseInputClasses} ${className}`}
            placeholder={placeholder || label}
            name={name}
            required={required}
            // limita visualmente o input (com hífen) a 9 caracteres, mas como
            // enviamos somente dígitos para o estado, o tamanho guardado será 8.
            inputMode={type === "cep" ? "numeric" : undefined}
          />
        );
      default:
        return (
          <div className="w-full">
            <input
              type={inputType}
              className={`${baseInputClasses} ${className}`}
              placeholder={placeholder || label}
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              required={required}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
      )}
      <div className="relative">
        {renderInput()}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 dark:text-slate-400 transition-colors hover:text-sky-600"
          >
            {passwordVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};
