using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MaterialChanger : MonoBehaviour
{
    public bool IncludeInners;

    Renderer[] joinObjects;

    [SerializeField]
    Material newmaterial;

    Material[] materialsOfObject;
   
    void Start()
    {
        if (IncludeInners)
        {
            joinObjects = GetComponentsInChildren<Renderer>();
        }
        else
        {
            joinObjects = new Renderer[1] { GetComponent<Renderer>() };
        }

        materialsOfObject = new Material[joinObjects.Length];
        int i = 0;
        foreach (Renderer m in joinObjects)
        {
            materialsOfObject[i] = m.material;
            i++;
        }
    }

    public void HighLightObject()
    {
        foreach (Renderer m in joinObjects)
        {
            m.material = newmaterial;
        }
    }

    public void BackMaterials()
    {
        if (materialsOfObject != null)
        {
            int i = 0;
            foreach (Renderer m in joinObjects)
            {
                m.material = materialsOfObject[i];
                i++;
            }
        }
    }
}
